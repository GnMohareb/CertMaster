package com.example.ui

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.ExamCatalog
import com.example.data.ExamRepository
import com.example.data.SpeechManager
import com.example.data.local.ActiveExamAttemptEntity
import com.example.data.local.SimulationScoreEntity
import com.example.domain.AdaptivePracticeEngine
import com.example.model.AudioOverview
import com.example.model.BankCoverageAudit
import com.example.model.DomainMasterySummary
import com.example.model.DomainScore
import com.example.model.EmbeddedBankMetadata
import com.example.model.ExamConfig
import com.example.model.ExamMode
import com.example.model.ExamReadinessReport
import com.example.model.ExamSession
import com.example.model.Flashcard
import com.example.model.JourneyMilestone
import com.example.model.PracticeAnswerFeedback
import com.example.model.PracticeRecommendation
import com.example.model.Question
import com.example.model.QuestionExposureState
import com.example.model.SourceDoc
import com.example.model.SsoSessionInfo
import com.example.model.SyncLogEntry
import com.example.model.TopicMasteryState
import com.example.model.UserCentralProfile
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

enum class AppScreen {
    DASHBOARD,
    EXAM_HUB,
    SIMULATION_ACTIVE,
    SESSION_RESULT,
    NOTEBOOK_SOURCES,
    AUDIO_OVERVIEW,
    AI_TUTOR,
    FLASHCARDS,
    EXAM_SELECTOR,
    BACKEND_SETTINGS,
    CENTRAL_PROFILE,
    WEB_PORTAL
}

class ExamViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = ExamRepository(context = application)
    val speechManager = SpeechManager(application)

    internal fun repositoryForTesting(): ExamRepository = repository

    // Current Screen
    private val _currentScreen = MutableStateFlow(AppScreen.DASHBOARD)
    val currentScreen: StateFlow<AppScreen> = _currentScreen.asStateFlow()

    // Navigation back stack for Android BackHandler
    private val screenStack = mutableListOf<AppScreen>()

    // Active Synchronized Data (All 11 Domains)
    val currentExam: StateFlow<ExamConfig> = repository.currentExam
    val questions: StateFlow<List<Question>> = repository.questions
    val sources: StateFlow<List<SourceDoc>> = repository.sources
    val audioOverviews: StateFlow<List<AudioOverview>> = repository.audioOverviews
    val flashcards: StateFlow<List<Flashcard>> = repository.flashcards
    val sessions: StateFlow<List<ExamSession>> = repository.sessions
    val simulationScores: StateFlow<List<SimulationScoreEntity>> = repository.simulationScores
    val savedActiveAttempt = repository.savedActiveAttempt
    val userProfile: StateFlow<UserCentralProfile> = repository.userProfile
    val ssoSession: StateFlow<SsoSessionInfo> = repository.ssoSession
    val readinessReport: StateFlow<ExamReadinessReport> = repository.readinessReport
    val studyPlanMilestones: StateFlow<List<JourneyMilestone>> = repository.studyPlanMilestones
    val syncLogs: StateFlow<List<SyncLogEntry>> = repository.syncLogs
    val pendingSyncCount: StateFlow<Int> = repository.pendingSyncCount
    val isOfflineCacheActive: StateFlow<Boolean> = repository.isOfflineCacheActive
    val aiMessages = repository.aiMessages
    val backendConfig = repository.backendConfig

    // Offline Adaptive Assessment, Mastery & Recommendations
    val bankMetadata: StateFlow<EmbeddedBankMetadata> = repository.bankMetadata
    val bankCoverageAudit: StateFlow<BankCoverageAudit> = repository.bankCoverageAudit
    val topicMasteryList: StateFlow<List<TopicMasteryState>> = repository.topicMasteryList
    val domainMasteryList: StateFlow<List<DomainMasterySummary>> = repository.domainMasteryList
    val questionExposures: StateFlow<Map<String, QuestionExposureState>> = repository.questionExposures
    val initialBaselineSession: StateFlow<ExamSession?> = repository.initialBaselineSession
    val recommendations: StateFlow<List<PracticeRecommendation>> = repository.recommendations

    // Behavioral Domain Stress Metrics
    private val _domainStressMetrics = MutableStateFlow(repository.getDomainStressMetricsList())
    val domainStressMetrics: StateFlow<List<com.example.model.DomainStressMetrics>> = _domainStressMetrics.asStateFlow()

    private val _highestStressDomain = MutableStateFlow(repository.getHighestStressDomain())
    val highestStressDomain: StateFlow<com.example.model.DomainStressMetrics?> = _highestStressDomain.asStateFlow()

    init {
        viewModelScope.launch {
            repository.sessions.collect {
                _domainStressMetrics.value = repository.getDomainStressMetricsList()
                _highestStressDomain.value = repository.getHighestStressDomain()
            }
        }
    }

    fun refreshStressMetrics() {
        _domainStressMetrics.value = repository.getDomainStressMetricsList()
        _highestStressDomain.value = repository.getHighestStressDomain()
        repository.recomputeReadinessAndStudyPlan()
    }

    // Active Test Simulation State
    private val _activeMode = MutableStateFlow(ExamMode.FULL_SIMULATION)
    val activeMode: StateFlow<ExamMode> = _activeMode.asStateFlow()

    private val _simulationQuestions = MutableStateFlow<List<Question>>(emptyList())
    val simulationQuestions: StateFlow<List<Question>> = _simulationQuestions.asStateFlow()

    private val _currentQuestionIndex = MutableStateFlow(0)
    val currentQuestionIndex: StateFlow<Int> = _currentQuestionIndex.asStateFlow()

    private val _userAnswers = MutableStateFlow<Map<Int, Int>>(emptyMap())
    val userAnswers: StateFlow<Map<Int, Int>> = _userAnswers.asStateFlow()

    private val _flaggedIndices = MutableStateFlow<Set<Int>>(emptySet())
    val flaggedIndices: StateFlow<Set<Int>> = _flaggedIndices.asStateFlow()

    private val _struckOptions = MutableStateFlow<Map<Int, Set<Int>>>(emptyMap())
    val struckOptions: StateFlow<Map<Int, Set<Int>>> = _struckOptions.asStateFlow()

    // Track option switches per question for authoritative behavioral stress calculation
    private val _optionSwitchCounts = MutableStateFlow<Map<Int, Int>>(emptyMap())

    private val _remainingSeconds = MutableStateFlow(120 * 60)
    val remainingSeconds: StateFlow<Int> = _remainingSeconds.asStateFlow()

    private val _isTimerPaused = MutableStateFlow(false)
    val isTimerPaused: StateFlow<Boolean> = _isTimerPaused.asStateFlow()

    // Adaptive Practice & Remediation Session State
    private var activeAttemptId: String = ""
    private val _checkedQuestionIndices = MutableStateFlow<Set<Int>>(emptySet())
    val checkedQuestionIndices: StateFlow<Set<Int>> = _checkedQuestionIndices.asStateFlow()

    private val _currentPracticeFeedback = MutableStateFlow<PracticeAnswerFeedback?>(null)
    val currentPracticeFeedback: StateFlow<PracticeAnswerFeedback?> = _currentPracticeFeedback.asStateFlow()

    private val _selectionReasons = MutableStateFlow<Map<String, String>>(emptyMap())
    val selectionReasons: StateFlow<Map<String, String>> = _selectionReasons.asStateFlow()

    private val _practiceExhaustionNotice = MutableStateFlow<String?>(null)
    val practiceExhaustionNotice: StateFlow<String?> = _practiceExhaustionNotice.asStateFlow()

    private var timerJob: Job? = null
    private var checkPracticeEvidenceJob: Job? = null
    internal var lastEvidenceErrorForTesting: Throwable? = null
    private var simulationStartedAtMillis: Long = 0L
    private var activeSimulationPaperId: String? = null

    private val _activeSimulationPaperTitle = MutableStateFlow<String?>(null)
    val activeSimulationPaperTitle: StateFlow<String?> = _activeSimulationPaperTitle.asStateFlow()

    private val _lastSimulationPaperId = MutableStateFlow<String?>(null)
    val lastSimulationPaperId: StateFlow<String?> = _lastSimulationPaperId.asStateFlow()

    private val _lastSimulationPaperTitle = MutableStateFlow<String?>(null)
    val lastSimulationPaperTitle: StateFlow<String?> = _lastSimulationPaperTitle.asStateFlow()

    private fun isStandaloneCsc(): Boolean =
        com.example.BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-")

    // Last completed session
    private val _lastCompletedSession = MutableStateFlow<ExamSession?>(null)
    val lastCompletedSession: StateFlow<ExamSession?> = _lastCompletedSession.asStateFlow()

    // Audio Overview selection
    private val _selectedAudio = MutableStateFlow<AudioOverview?>(null)
    val selectedAudio: StateFlow<AudioOverview?> = _selectedAudio.asStateFlow()

    // Active Flashcard index and flip state
    private val _currentCardIndex = MutableStateFlow(0)
    val currentCardIndex: StateFlow<Int> = _currentCardIndex.asStateFlow()

    private val _isCardFlipped = MutableStateFlow(false)
    val isCardFlipped: StateFlow<Boolean> = _isCardFlipped.asStateFlow()

    // Selected Source Doc for reading/deep study
    private val _selectedSource = MutableStateFlow<SourceDoc?>(null)
    val selectedSource: StateFlow<SourceDoc?> = _selectedSource.asStateFlow()

    // Backend sync banner message
    private val _statusMessage = MutableStateFlow<String?>(null)
    val statusMessage: StateFlow<String?> = _statusMessage.asStateFlow()

    fun navigateTo(screen: AppScreen) {
        if (_currentScreen.value != screen) {
            screenStack.add(_currentScreen.value)
            _currentScreen.value = screen
        }
    }

    fun handleBackPress(): Boolean {
        if (screenStack.isNotEmpty()) {
            _currentScreen.value = screenStack.removeAt(screenStack.lastIndex)
            return true
        }
        return false
    }

    fun navigateBack() {
        if (!handleBackPress()) {
            _currentScreen.value = AppScreen.DASHBOARD
        }
    }

    fun showStatus(message: String) {
        _statusMessage.value = message
    }

    companion object {
        const val FREE_ASSESSMENT_QUESTION_LIMIT = 50
    }

    private val _showUpgradePrompt = MutableStateFlow(false)
    val showUpgradePrompt: StateFlow<Boolean> = _showUpgradePrompt.asStateFlow()

    fun dismissUpgradePrompt() {
        _showUpgradePrompt.value = false
    }

    fun openUpgradePrompt() {
        _showUpgradePrompt.value = true
    }

    fun isCurrentExamSubscribed(): Boolean {
        val sub = repository.userProfile.value.subscriptions.firstOrNull { it.examId == repository.currentExam.value.id }
        return sub?.status == com.example.model.SubStatus.ACTIVE
    }

    private fun buildActiveAttemptEntity(pausedOverride: Boolean? = null): ActiveExamAttemptEntity? {
        val qList = _simulationQuestions.value
        if (qList.isEmpty()) return null
        return ActiveExamAttemptEntity(
            examId = ExamCatalog.normalizeExamId(repository.currentExam.value.id),
            mode = _activeMode.value.name,
            questionIdsJson = ActiveExamAttemptEntity.encodeStringList(qList.map { it.id }),
            currentIndex = _currentQuestionIndex.value.coerceIn(0, qList.lastIndex),
            userAnswersJson = ActiveExamAttemptEntity.encodeIntIntMap(_userAnswers.value),
            flaggedIndicesJson = ActiveExamAttemptEntity.encodeIntSet(_flaggedIndices.value),
            struckOptionsJson = ActiveExamAttemptEntity.encodeIntSetMap(_struckOptions.value),
            optionSwitchCountsJson = ActiveExamAttemptEntity.encodeIntIntMap(_optionSwitchCounts.value),
            remainingSeconds = _remainingSeconds.value.coerceAtLeast(0),
            isPaused = pausedOverride ?: _isTimerPaused.value,
            startedAtMillis = simulationStartedAtMillis,
            updatedAtMillis = System.currentTimeMillis(),
            attemptId = activeAttemptId.ifBlank { UUID.randomUUID().toString() },
            checkedIndicesJson = ActiveExamAttemptEntity.encodeIntSet(_checkedQuestionIndices.value),
            selectionReasonsJson = ActiveExamAttemptEntity.encodeStringMap(_selectionReasons.value)
        )
    }

    private fun persistActiveAttempt(pausedOverride: Boolean? = null) {
        val entity = buildActiveAttemptEntity(pausedOverride) ?: return
        repository.saveActiveAttempt(entity)
    }

    fun onAppBackgrounded() {
        if (_simulationQuestions.value.isNotEmpty() && _currentScreen.value == AppScreen.SIMULATION_ACTIVE) {
            pauseTimer()
            persistActiveAttempt(pausedOverride = true)
        }
    }

    fun startAdaptivePractice(
        domainFilterId: String? = null,
        topicFilterKey: String? = null,
        mode: ExamMode = ExamMode.AI_ADAPTIVE_DRILL,
        requestedCount: Int? = null
    ) {
        startSimulation(
            mode = mode,
            domainFilterId = domainFilterId,
            topicFilterKey = topicFilterKey,
            requestedCount = requestedCount
        )
    }

    fun startSimulationPaper(paperId: String) {
        startSimulation(
            mode = ExamMode.FULL_SIMULATION,
            simulationPaperId = paperId
        )
    }

    fun startSimulation(
        mode: ExamMode,
        domainFilterId: String? = null,
        topicFilterKey: String? = null,
        requestedCount: Int? = null,
        simulationPaperId: String? = null
    ) {
        val isSubscribed = isStandaloneCsc() || isCurrentExamSubscribed()

        // If user is on Free Tier (non-standalone) and requests Full Simulation, route to 50-Question Free Diagnostic Assessment
        val effectiveMode = if (mode == ExamMode.FULL_SIMULATION && !isSubscribed) {
            _statusMessage.value = "Starting Free Assessment. Unlock complete exams anytime."
            ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT
        } else {
            mode
        }

        val allQ = repository.questions.value
        val availablePapers = repository.bankMetadata.value.simulationPapers
        val selectedPaper = if (effectiveMode == ExamMode.FULL_SIMULATION) {
            when {
                simulationPaperId != null -> {
                    val matched = availablePapers.firstOrNull { it.id == simulationPaperId }
                    if (matched == null) {
                        _statusMessage.value = "Selected exam paper is unavailable."
                        return
                    }
                    matched
                }
                availablePapers.isNotEmpty() -> availablePapers.first()
                else -> null
            }
        } else {
            null
        }

        if (effectiveMode == ExamMode.FULL_SIMULATION && selectedPaper == null && isStandaloneCsc()) {
            val hasReservedFullExam = allQ.any { it.questionPool == com.example.model.QuestionPool.FULL_EXAM_RESERVED }
            val isPracticeOnlyBank = allQ.isNotEmpty() &&
                !hasReservedFullExam &&
                allQ.any {
                    it.questionPool == com.example.model.QuestionPool.PRACTICE ||
                        it.questionPool == com.example.model.QuestionPool.ASSESSMENT
                }
            if (isPracticeOnlyBank) {
                _statusMessage.value = "Full timed exam simulations are coming soon. Choose Initial Assessment or Topic/Domain Practice."
                return
            }
        }

        _activeMode.value = effectiveMode
        val nowMillis = System.currentTimeMillis()
        var selectionReasonsMap: Map<String, String> = emptyMap()
        var exhaustionNotice: String? = null

        val questionsToUse = when {
            selectedPaper != null -> {
                val byId = allQ.associateBy { it.id }
                val orderedPaperQuestions = selectedPaper.questionIds.mapNotNull { byId[it] }
                if (orderedPaperQuestions.size != selectedPaper.questionIds.size || orderedPaperQuestions.isEmpty()) {
                    _statusMessage.value = "Selected exam paper questions are incomplete or missing."
                    return
                }
                orderedPaperQuestions
            }
            effectiveMode == ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT &&
                repository.bankMetadata.value.diagnosticQuestionIds.isNotEmpty() -> {
                val byId = allQ.associateBy { it.id }
                val ids = repository.bankMetadata.value.diagnosticQuestionIds
                val diagnostic = ids.mapNotNull { byId[it] }
                if (diagnostic.size != ids.size) {
                    _statusMessage.value = "Diagnostic assessment questions are incomplete."
                    return
                }
                diagnostic
            }
            effectiveMode == ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT -> {
                val filteredByDomain = if (domainFilterId != null) {
                    allQ.filter { it.domainId == domainFilterId }
                } else {
                    allQ
                }
                val eligibleCount = filteredByDomain.count {
                    it.questionPool != com.example.model.QuestionPool.FULL_EXAM_RESERVED
                }
                val defaultLength = if (isStandaloneCsc() && eligibleCount in 1..60) {
                    eligibleCount
                } else {
                    repository.adaptiveConfig.initialAssessmentDefaultLength
                }
                val effectiveMaxLimit = if (isStandaloneCsc()) {
                    eligibleCount.coerceAtLeast(FREE_ASSESSMENT_QUESTION_LIMIT)
                } else {
                    FREE_ASSESSMENT_QUESTION_LIMIT
                }
                AdaptivePracticeEngine.selectInitialAssessmentQuestions(
                    allQuestions = filteredByDomain,
                    syllabusWeights = repository.bankMetadata.value.syllabusWeights,
                    targetLength = requestedCount ?: defaultLength,
                    maxLimit = effectiveMaxLimit
                )
            }
            AdaptivePracticeEngine.isAdaptivePracticeMode(effectiveMode) -> {
                val topicMap = repository.topicMasteryList.value.associateBy { it.topicKey }
                val currentMaxOrder = repository.questionExposures.value.values.maxOfOrNull { it.lastGlobalOrder } ?: 0L
                val selection = AdaptivePracticeEngine.selectAdaptivePracticeQuestions(
                    allQuestions = allQ,
                    mode = effectiveMode,
                    topicStates = topicMap,
                    exposures = repository.questionExposures.value,
                    nowMillis = nowMillis,
                    currentGlobalStep = currentMaxOrder,
                    domainFilterId = domainFilterId,
                    topicFilterKey = topicFilterKey,
                    requestedCount = requestedCount,
                    config = repository.adaptiveConfig
                )
                selectionReasonsMap = selection.selectionReasons
                exhaustionNotice = selection.exhaustionNotice
                selection.questions
            }
            else -> {
                AdaptivePracticeEngine.eligibleQuestionsForMode(
                    allQuestions = allQ,
                    mode = effectiveMode,
                    domainFilterId = domainFilterId,
                    topicFilterKey = topicFilterKey
                )
            }
        }

        if (questionsToUse.isEmpty()) {
            _statusMessage.value = "Practice questions are not installed yet for this exam."
            return
        }

        activeSimulationPaperId = selectedPaper?.id
        _activeSimulationPaperTitle.value = selectedPaper?.title
        activeAttemptId = UUID.randomUUID().toString()
        _simulationQuestions.value = questionsToUse
        _currentQuestionIndex.value = 0
        _userAnswers.value = emptyMap()
        _flaggedIndices.value = emptySet()
        _struckOptions.value = emptyMap()
        _optionSwitchCounts.value = emptyMap()
        _checkedQuestionIndices.value = emptySet()
        _currentPracticeFeedback.value = null
        _selectionReasons.value = selectionReasonsMap


        _practiceExhaustionNotice.value = exhaustionNotice

        val timeLimit = when {
            selectedPaper != null -> selectedPaper.durationMinutes * 60
            effectiveMode == ExamMode.FULL_SIMULATION -> repository.currentExam.value.durationMinutes * 60
            else -> questionsToUse.size * 90 // 1.5 min per question
        }
        _remainingSeconds.value = timeLimit
        simulationStartedAtMillis = nowMillis
        _isTimerPaused.value = false

        persistActiveAttempt(pausedOverride = false)
        startTimer()
        navigateTo(AppScreen.SIMULATION_ACTIVE)
    }

    fun resumeSavedSimulation(): Boolean {
        val saved = repository.savedActiveAttempt.value ?: return false
        val byId = repository.questions.value.associateBy { it.id }
        val restoredQuestions = saved.parseQuestionIds().mapNotNull { byId[it] }
        if (restoredQuestions.isEmpty()) {
            repository.clearActiveAttempt(saved.examId)
            _statusMessage.value = "Saved session questions are no longer installed."
            return false
        }

        activeAttemptId = saved.attemptId.ifBlank { UUID.randomUUID().toString() }
        _activeMode.value = saved.parseExamMode()
        val matchedPaper = if (_activeMode.value == ExamMode.FULL_SIMULATION) {
            val restoredIds = restoredQuestions.map { it.id }
            repository.bankMetadata.value.simulationPapers.firstOrNull { it.questionIds == restoredIds }
        } else {
            null
        }
        activeSimulationPaperId = matchedPaper?.id
        _activeSimulationPaperTitle.value = matchedPaper?.title
        _simulationQuestions.value = restoredQuestions
        val restoredIdx = saved.currentIndex.coerceIn(0, restoredQuestions.lastIndex)
        _currentQuestionIndex.value = restoredIdx
        _userAnswers.value = saved.parseUserAnswers().filterKeys { it in restoredQuestions.indices }
        _flaggedIndices.value = saved.parseFlaggedIndices().filter { it in restoredQuestions.indices }.toSet()
        _struckOptions.value = saved.parseStruckOptions().filterKeys { it in restoredQuestions.indices }
        _optionSwitchCounts.value = saved.parseOptionSwitchCounts().filterKeys { it in restoredQuestions.indices }
        val restoredChecked = saved.parseCheckedIndices().filter { it in restoredQuestions.indices }.toSet()
        _checkedQuestionIndices.value = restoredChecked

        _selectionReasons.value = saved.parseSelectionReasons()

        _practiceExhaustionNotice.value = null

        _currentPracticeFeedback.value = if (
            AdaptivePracticeEngine.isAdaptivePracticeMode(_activeMode.value) &&
            restoredChecked.contains(restoredIdx)
        ) {
            buildFeedbackForIndex(restoredIdx, remediationQuestionId = null, remediationNotice = null, updatedTopic = null)
        } else {
            null
        }

        _remainingSeconds.value = saved.remainingSeconds.coerceAtLeast(1)
        simulationStartedAtMillis = saved.startedAtMillis
        _isTimerPaused.value = false

        persistActiveAttempt(pausedOverride = false)
        startTimer()
        navigateTo(AppScreen.SIMULATION_ACTIVE)
        return true
    }

    fun pauseAndExitToDashboard() {
        pauseTimer(persistAttempt = false)
        persistActiveAttempt(pausedOverride = true)
        screenStack.clear()
        _currentScreen.value = AppScreen.DASHBOARD
        _statusMessage.value = "Session saved on this device. You can resume anytime from the Dashboard."
    }

    fun abandonSimulation() {
        timerJob?.cancel()
        _isTimerPaused.value = false
        activeSimulationPaperId = null
        _activeSimulationPaperTitle.value = null
        activeAttemptId = ""
        _simulationQuestions.value = emptyList()
        _currentQuestionIndex.value = 0
        _userAnswers.value = emptyMap()
        _flaggedIndices.value = emptySet()
        _struckOptions.value = emptyMap()
        _optionSwitchCounts.value = emptyMap()
        _checkedQuestionIndices.value = emptySet()
        _currentPracticeFeedback.value = null
        _selectionReasons.value = emptyMap()


        _practiceExhaustionNotice.value = null
        repository.clearActiveAttempt()
        if (!handleBackPress()) {
            _currentScreen.value = AppScreen.DASHBOARD
        }
    }

    fun openHistoricalSession(session: ExamSession) {
        val byId = repository.questions.value.associateBy { it.id }
        val resolvedQuestions = session.questionIds.mapNotNull { byId[it] }
        val matchedPaper = if (session.mode == ExamMode.FULL_SIMULATION) {
            repository.bankMetadata.value.simulationPapers.firstOrNull { it.questionIds == session.questionIds }
        } else {
            null
        }
        _lastSimulationPaperId.value = matchedPaper?.id
        _lastSimulationPaperTitle.value = matchedPaper?.title
        _simulationQuestions.value = resolvedQuestions
        _lastCompletedSession.value = session
        navigateTo(AppScreen.SESSION_RESULT)
    }

    private fun startTimer() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            var tickCount = 0
            while (_remainingSeconds.value > 0) {
                delay(1000)
                if (!_isTimerPaused.value) {
                    _remainingSeconds.value -= 1
                    tickCount++
                    if (tickCount % 5 == 0) {
                        persistActiveAttempt()
                    }
                }
            }
            if (_remainingSeconds.value <= 0 && _currentScreen.value == AppScreen.SIMULATION_ACTIVE) {
                finishSimulation()
            }
        }
    }

    fun pauseTimer(persistAttempt: Boolean = true) {
        _isTimerPaused.value = true
        timerJob?.cancel()
        if (persistAttempt) {
            persistActiveAttempt(pausedOverride = true)
        }
    }

    fun resumeTimer() {
        if (_isTimerPaused.value) {
            _isTimerPaused.value = false
            persistActiveAttempt(pausedOverride = false)
            startTimer()
        }
    }

    fun selectOption(questionIndex: Int, optionIndex: Int) {
        if (AdaptivePracticeEngine.isAdaptivePracticeMode(_activeMode.value) &&
            _checkedQuestionIndices.value.contains(questionIndex)
        ) {
            return
        }
        val current = _userAnswers.value.toMutableMap()
        val previous = current[questionIndex]
        if (previous != null && previous != optionIndex) {
            val switches = _optionSwitchCounts.value.toMutableMap()
            switches[questionIndex] = (switches[questionIndex] ?: 0) + 1
            _optionSwitchCounts.value = switches
        }
        current[questionIndex] = optionIndex
        _userAnswers.value = current
        persistActiveAttempt()
    }

    fun toggleFlagQuestion(questionIndex: Int) {
        val current = _flaggedIndices.value.toMutableSet()
        if (current.contains(questionIndex)) {
            current.remove(questionIndex)
        } else {
            current.add(questionIndex)
        }
        _flaggedIndices.value = current
        persistActiveAttempt()
    }

    fun toggleStrikeOption(questionIndex: Int, optionIndex: Int) {
        val allStruck = _struckOptions.value.toMutableMap()
        val questionStruck = allStruck[questionIndex]?.toMutableSet() ?: mutableSetOf()
        if (questionStruck.contains(optionIndex)) {
            questionStruck.remove(optionIndex)
        } else {
            questionStruck.add(optionIndex)
        }
        allStruck[questionIndex] = questionStruck
        _struckOptions.value = allStruck
        persistActiveAttempt()
    }

    private fun buildFeedbackForIndex(
        questionIndex: Int,
        remediationQuestionId: String?,
        remediationNotice: String?,
        updatedTopic: TopicMasteryState?
    ): PracticeAnswerFeedback? {
        val question = _simulationQuestions.value.getOrNull(questionIndex) ?: return null
        val selectedIndex = _userAnswers.value[questionIndex] ?: return null
        val isCorrect = selectedIndex == question.correctIndex
        val topicMeta = AdaptivePracticeEngine.resolveTopic(question)
        val resolvedTopicState = updatedTopic
            ?: repository.topicMasteryList.value.firstOrNull { it.topicKey == topicMeta.topicKey }
        return PracticeAnswerFeedback(
            questionId = question.id,
            questionIndex = questionIndex,
            selectedIndex = selectedIndex,
            correctIndex = question.correctIndex,
            isCorrect = isCorrect,
            explanation = question.explanation,
            selectedOptionAnalysis = question.optionAnalysis[selectedIndex],
            correctOptionAnalysis = question.optionAnalysis[question.correctIndex],
            learningObjective = question.learningObjective,
            citationTitle = question.citation.title,
            citationSection = question.citation.sectionOrPage,
            remediationQuestionId = remediationQuestionId,
            remediationNotice = remediationNotice,
            updatedTopicMastery = resolvedTopicState
        )
    }

    /**
     * Checks the selected answer during adaptive practice modes, reveals explanation & distractor analysis,
     * applies evidence idempotently to topic mastery, queues a different follow-up question on the same topic
     * or domain if incorrect.
     */
    fun checkPracticeAnswer(questionIndex: Int = _currentQuestionIndex.value) {
        if (!AdaptivePracticeEngine.isAdaptivePracticeMode(_activeMode.value)) return
        val questionsList = _simulationQuestions.value
        val question = questionsList.getOrNull(questionIndex) ?: return
        val selectedIndex = _userAnswers.value[questionIndex] ?: return

        val alreadyChecked = _checkedQuestionIndices.value.contains(questionIndex)
        if (alreadyChecked) {
            _currentPracticeFeedback.value = buildFeedbackForIndex(
                questionIndex = questionIndex,
                remediationQuestionId = null,
                remediationNotice = null,
                updatedTopic = null
            )
            return
        }

        _checkedQuestionIndices.value = _checkedQuestionIndices.value + questionIndex
        val isCorrect = selectedIndex == question.correctIndex
        var queuedRemediationId: String? = null
        var notice: String? = null

        if (!isCorrect) {
            val nextIdx = questionIndex + 1
            val interactedIndices = _userAnswers.value.keys + _flaggedIndices.value +
                _struckOptions.value.keys + _optionSwitchCounts.value.keys + _checkedQuestionIndices.value
            val canReorderUpcoming = nextIdx !in interactedIndices
            val excludedIds = questionsList.mapIndexedNotNull { index, item ->
                item.id.takeIf { index <= questionIndex || !canReorderUpcoming || index in interactedIndices }
            }.toSet()
            val followUp = AdaptivePracticeEngine.pickImmediateRemediationQuestion(
                missedQuestion = question,
                allQuestions = repository.questions.value,
                excludeQuestionIds = excludedIds,
                exposures = repository.questionExposures.value
            )
            if (followUp != null) {
                val existingIndex = questionsList.indexOfFirst { it.id == followUp.id }
                val updatedList = questionsList.toMutableList()
                if (existingIndex >= 0) {
                    updatedList[existingIndex] = updatedList[nextIdx]
                    updatedList[nextIdx] = followUp
                } else {
                    updatedList.add(nextIdx, followUp)
                    _userAnswers.value = _userAnswers.value.mapKeys { (k, _) -> if (k >= nextIdx) k + 1 else k }
                    _flaggedIndices.value = _flaggedIndices.value.map { k -> if (k >= nextIdx) k + 1 else k }.toSet()
                    _struckOptions.value = _struckOptions.value.mapKeys { (k, _) -> if (k >= nextIdx) k + 1 else k }
                    _optionSwitchCounts.value = _optionSwitchCounts.value.mapKeys { (k, _) -> if (k >= nextIdx) k + 1 else k }
                    _checkedQuestionIndices.value = _checkedQuestionIndices.value.map { k -> if (k >= nextIdx) k + 1 else k }.toSet()
                }
                _simulationQuestions.value = updatedList
                val topicName = AdaptivePracticeEngine.resolveTopic(followUp).topicName
                _selectionReasons.value = _selectionReasons.value + (followUp.id to "Follow-up on '$topicName' after missed item")
                queuedRemediationId = followUp.id
                notice = "Next: a different question on $topicName."
            }

        }

        _currentPracticeFeedback.value = buildFeedbackForIndex(
            questionIndex = questionIndex,
            remediationQuestionId = queuedRemediationId,
            remediationNotice = notice,
            updatedTopic = null
        )

        val attemptKey = activeAttemptId.ifBlank { UUID.randomUUID().toString() }
        activeAttemptId = attemptKey
        persistActiveAttempt()

        val capturedMode = _activeMode.value
        val previousJob = checkPracticeEvidenceJob
        lastEvidenceErrorForTesting = null
        checkPracticeEvidenceJob = viewModelScope.launch {
            previousJob?.join()
            try {
                val updatedTopic = repository.recordAnswerEvidence(
                    attemptId = attemptKey,
                    question = question,
                    selectedIndex = selectedIndex,
                    mode = capturedMode
                )
                if (_currentQuestionIndex.value == questionIndex && _currentPracticeFeedback.value?.questionId == question.id) {
                    _currentPracticeFeedback.value = _currentPracticeFeedback.value?.copy(
                        updatedTopicMastery = updatedTopic
                    )
                }
            } catch (ce: kotlinx.coroutines.CancellationException) {
                throw ce
            } catch (t: Throwable) {
                lastEvidenceErrorForTesting = t
                throw t
            }
        }
    }

    fun goToQuestion(index: Int) {
        if (index in 0 until _simulationQuestions.value.size) {
            _currentQuestionIndex.value = index
            _currentPracticeFeedback.value = if (
                AdaptivePracticeEngine.isAdaptivePracticeMode(_activeMode.value) &&
                _checkedQuestionIndices.value.contains(index)
            ) {
                buildFeedbackForIndex(index, null, null, null)
            } else {
                null
            }
            persistActiveAttempt()
        }
    }

    fun nextQuestion() {
        if (_currentQuestionIndex.value < _simulationQuestions.value.size - 1) {
            val nextIdx = _currentQuestionIndex.value + 1
            _currentQuestionIndex.value = nextIdx
            _currentPracticeFeedback.value = if (
                AdaptivePracticeEngine.isAdaptivePracticeMode(_activeMode.value) &&
                _checkedQuestionIndices.value.contains(nextIdx)
            ) {
                buildFeedbackForIndex(nextIdx, null, null, null)
            } else {
                null
            }
            persistActiveAttempt()
        }
    }

    fun previousQuestion() {
        if (_currentQuestionIndex.value > 0) {
            val prevIdx = _currentQuestionIndex.value - 1
            _currentQuestionIndex.value = prevIdx
            _currentPracticeFeedback.value = if (
                AdaptivePracticeEngine.isAdaptivePracticeMode(_activeMode.value) &&
                _checkedQuestionIndices.value.contains(prevIdx)
            ) {
                buildFeedbackForIndex(prevIdx, null, null, null)
            } else {
                null
            }
            persistActiveAttempt()
        }
    }

    fun finishSimulation() {
        timerJob?.cancel()
        val questionsList = _simulationQuestions.value
        val answers = _userAnswers.value
        val total = questionsList.size

        if (total == 0) return

        var correctCount = 0
        val domainStats = mutableMapOf<String, Pair<String, Pair<Int, Int>>>()

        questionsList.forEachIndexed { idx, q ->
            val userChoice = answers[idx]
            val isCorrect = userChoice == q.correctIndex
            if (isCorrect) correctCount++

            val existing = domainStats[q.domainId] ?: Pair(q.domainName, Pair(0, 0))
            val newCorrect = existing.second.first + (if (isCorrect) 1 else 0)
            val newTotal = existing.second.second + 1
            domainStats[q.domainId] = Pair(existing.first, Pair(newCorrect, newTotal))
        }

        val scorePct = Math.round((correctCount.toDouble() / total) * 100.0).toInt()
        val passingThreshold = repository.currentExam.value.passingScorePercent
        val isPassed = scorePct >= passingThreshold

        val domainScores = domainStats.map { (id, pair) ->
            val correct = pair.second.first
            val dTotal = pair.second.second
            val pct = if (dTotal > 0) Math.round((correct.toDouble() / dTotal) * 100.0).toInt() else 0
            DomainScore(id, pair.first, correct, dTotal, pct)
        }

        val activePaper = activeSimulationPaperId?.let { id ->
            repository.bankMetadata.value.simulationPapers.firstOrNull { it.id == id }
        } ?: if (_activeMode.value == ExamMode.FULL_SIMULATION) {
            val qIds = questionsList.map { it.id }
            repository.bankMetadata.value.simulationPapers.firstOrNull { it.questionIds == qIds }
        } else {
            null
        }

        val totalSwitches = _optionSwitchCounts.value.values.sum()
        val configuredSeconds = when {
            activePaper != null -> activePaper.durationMinutes * 60
            _activeMode.value == ExamMode.FULL_SIMULATION -> repository.currentExam.value.durationMinutes * 60
            else -> total * 90
        }
        val elapsedSeconds = (configuredSeconds - _remainingSeconds.value)
            .takeIf { it > 0 }
            ?: ((System.currentTimeMillis() - simulationStartedAtMillis) / 1000L)
                .coerceAtLeast(1L)
                .coerceAtMost(configuredSeconds.toLong().coerceAtLeast(1L))
                .toInt()

        val attemptKey = activeAttemptId.ifBlank { UUID.randomUUID().toString() }
        val session = ExamSession(
            sessionId = UUID.randomUUID().toString(),
            examId = repository.currentExam.value.id,
            mode = _activeMode.value,
            startTimeMillis = simulationStartedAtMillis,
            durationSeconds = elapsedSeconds,
            totalQuestions = total,
            userAnswers = answers,
            flaggedIndices = _flaggedIndices.value,
            struckOptions = _struckOptions.value,
            completedTimeMillis = System.currentTimeMillis(),
            scorePercent = scorePct,
            isPassed = isPassed,
            domainScores = domainScores,
            questionIds = questionsList.map { it.id }
        )

        repository.recordSession(
            session = session,
            optionSwitchCount = totalSwitches,
            sessionQuestions = questionsList,
            attemptId = attemptKey
        )
        _lastSimulationPaperId.value = activePaper?.id
        _lastSimulationPaperTitle.value = activePaper?.title
        activeSimulationPaperId = null
        _activeSimulationPaperTitle.value = null
        _checkedQuestionIndices.value = emptySet()
        _currentPracticeFeedback.value = null

        _selectionReasons.value = emptyMap()
        _practiceExhaustionNotice.value = null
        activeAttemptId = ""
        refreshStressMetrics()
        _lastCompletedSession.value = repository.sessions.value.firstOrNull { it.sessionId == session.sessionId } ?: session
        navigateTo(AppScreen.SESSION_RESULT)
    }

    fun openAudioOverview(audio: AudioOverview) {
        _selectedAudio.value = audio
        navigateTo(AppScreen.AUDIO_OVERVIEW)
    }

    fun playAudioTurn(turnIndex: Int) {
        val audio = _selectedAudio.value ?: return
        if (turnIndex in audio.turns.indices) {
            val turn = audio.turns[turnIndex]
            val isFemale = turn.speaker.contains("Maya")
            speechManager.speakTurn(turn.text, turnIndex, isFemale)
        }
    }

    fun openSource(doc: SourceDoc) {
        _selectedSource.value = doc
    }

    fun closeSource() {
        _selectedSource.value = null
    }

    fun sendAIPrompt(prompt: String) {
        if (isStandaloneCsc()) {
            _statusMessage.value = "AI tutor requires internet and is unavailable in this edition."
            return
        }
        repository.sendAIMessage(prompt)
    }

    fun nextFlashcard() {
        _isCardFlipped.value = false
        val list = repository.flashcards.value
        if (list.isNotEmpty()) {
            val safeIdx = _currentCardIndex.value.coerceIn(0, list.lastIndex)
            _currentCardIndex.value = (safeIdx + 1) % list.size
        }
    }

    fun prevFlashcard() {
        _isCardFlipped.value = false
        val list = repository.flashcards.value
        if (list.isNotEmpty()) {
            val safeIdx = _currentCardIndex.value.coerceIn(0, list.lastIndex)
            _currentCardIndex.value = if (safeIdx > 0) safeIdx - 1 else list.size - 1
        }
    }

    fun flipFlashcard() {
        _isCardFlipped.value = !_isCardFlipped.value
    }

    fun rateFlashcard(boxLevel: Int) {
        val list = repository.flashcards.value
        if (list.isNotEmpty()) {
            val safeIdx = _currentCardIndex.value.coerceIn(0, list.lastIndex)
            val current = list[safeIdx]
            repository.updateFlashcardBox(current.id, boxLevel)
            nextFlashcard()
        }
    }

    fun addFlashcard(
        frontPrompt: String,
        backAnswer: String,
        keyRule: String = "",
        domainId: String = "",
        sourceCitation: String = "Personal Study Card"
    ) {
        repository.addFlashcard(frontPrompt, backAnswer, keyRule, domainId, sourceCitation)
        _currentCardIndex.value = 0
        _isCardFlipped.value = false
    }

    fun addSourceDoc(title: String, summary: String, takeaways: List<String>, content: String, domainId: String) {
        repository.addSourceDoc(title, summary, takeaways, content, domainId)
    }

    fun selectExam(examId: String) {
        if (isStandaloneCsc()) {
            _statusMessage.value = "This offline edition contains one certification."
            return
        }
        repository.switchExam(examId)
        refreshStressMetrics()
        _statusMessage.value = "Switched to ${repository.currentExam.value.shortCode}"
        navigateTo(AppScreen.DASHBOARD)
    }

    fun saveBackendSettings(url: String, key: String) {
        if (isStandaloneCsc()) {
            _statusMessage.value = "Backend settings are unavailable in the offline edition."
            return
        }
        repository.updateBackendConfig(url, key)
        viewModelScope.launch {
            val success = repository.syncWithBackend()
            _statusMessage.value = if (success) "Connected to CertMaster backend & synchronized all 11 domains!" else "Backend configuration saved."
        }
    }

    fun subscribeToExam(examId: String) {
        if (isStandaloneCsc()) return
        repository.subscribeToSubject(examId)
        val exam = ExamCatalog.getExamById(examId)
        _statusMessage.value = "Paid access for ${exam.shortCode} is activated only after payment is verified by the CertMaster server. Complete checkout on the web platform; your access will appear here after sync."
    }

    fun syncCentralProfile() {
        if (isStandaloneCsc()) return
        viewModelScope.launch {
            val ok = repository.syncCentralProfileWithCloud()
            _statusMessage.value = if (ok) {
                "Synchronized all 11 domains (Profile, Catalog, Scores, Study Plan, Flashcards & Readiness) with CertMaster Cloud"
            } else {
                "Offline mode: changes cached locally and queued for sync"
            }
        }
    }

    fun authenticateWithGoogleSso(activityContext: Context) {
        if (isStandaloneCsc()) return
        viewModelScope.launch {
            val res = repository.authManager.signInWithGoogle(activityContext)
            if (res.isSuccess) {
                repository.syncCentralProfileWithCloud()
                _statusMessage.value = "Google SSO Verified & Synchronized with CertMaster Web Platform"
            } else {
                _statusMessage.value = "Google sign-in failed: " + (res.exceptionOrNull()?.message ?: "unknown error") + ". You are not signed in; progress stays on this device only."
            }
        }
    }

    fun startAssessmentExam() {
        startSimulation(ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT)
    }

    fun clearStatusMessage() {
        _statusMessage.value = null
    }

    internal suspend fun closeForTesting(awaitWrites: Boolean = true) {
        speechManager.shutdown()
        timerJob?.cancel()
        if (awaitWrites) {
            checkPracticeEvidenceJob?.join()
            repository.awaitPendingWritesForTesting()
        } else {
            checkPracticeEvidenceJob?.cancel()
        }
        repository.shutdown()
    }

    override fun onCleared() {
        super.onCleared()
        speechManager.shutdown()
        timerJob?.cancel()
        repository.shutdown()
    }
}

