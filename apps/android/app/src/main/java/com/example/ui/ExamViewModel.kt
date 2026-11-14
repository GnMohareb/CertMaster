package com.example.ui

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.ExamCatalog
import com.example.data.ExamRepository
import com.example.data.SpeechManager
import com.example.data.local.SimulationScoreEntity
import com.example.model.AudioOverview
import com.example.model.DomainScore
import com.example.model.ExamConfig
import com.example.model.ExamMode
import com.example.model.ExamReadinessReport
import com.example.model.ExamSession
import com.example.model.Flashcard
import com.example.model.JourneyMilestone
import com.example.model.Question
import com.example.model.SourceDoc
import com.example.model.SsoSessionInfo
import com.example.model.SyncLogEntry
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
    val userProfile: StateFlow<UserCentralProfile> = repository.userProfile
    val ssoSession: StateFlow<SsoSessionInfo> = repository.ssoSession
    val readinessReport: StateFlow<ExamReadinessReport> = repository.readinessReport
    val studyPlanMilestones: StateFlow<List<JourneyMilestone>> = repository.studyPlanMilestones
    val syncLogs: StateFlow<List<SyncLogEntry>> = repository.syncLogs
    val pendingSyncCount: StateFlow<Int> = repository.pendingSyncCount
    val isOfflineCacheActive: StateFlow<Boolean> = repository.isOfflineCacheActive
    val aiMessages = repository.aiMessages
    val backendConfig = repository.backendConfig

    // Behavioral Domain Stress Metrics
    private val _domainStressMetrics = MutableStateFlow(repository.getDomainStressMetricsList())
    val domainStressMetrics: StateFlow<List<com.example.model.DomainStressMetrics>> = _domainStressMetrics.asStateFlow()

    private val _highestStressDomain = MutableStateFlow(repository.getHighestStressDomain())
    val highestStressDomain: StateFlow<com.example.model.DomainStressMetrics?> = _highestStressDomain.asStateFlow()

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

    private var timerJob: Job? = null
    private var simulationStartedAtMillis: Long = 0L
    private var simulationTimeLimitSeconds: Int = 0

    private fun isStandaloneCsc(): Boolean =
        repository.currentExam.value.shortCode.contains("CSC", ignoreCase = true)

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

    fun startSimulation(mode: ExamMode, domainFilterId: String? = null) {
        val isSubscribed = isStandaloneCsc() || isCurrentExamSubscribed()

        // If user is on Free Tier and requests Full Simulation, route to 50-Question Free Diagnostic Assessment
        val effectiveMode = if (mode == ExamMode.FULL_SIMULATION && !isSubscribed) {
            _statusMessage.value = "Starting 50-Question Free Assessment. Upgrade anytime to unlock all full simulations."
            ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT
        } else {
            mode
        }

        _activeMode.value = effectiveMode
        val allQ = repository.questions.value
        val filtered = if (domainFilterId != null) {
            allQ.filter { it.domainId == domainFilterId }
        } else {
            allQ
        }

        // Free tier or diagnostic assessment caps at 50 questions
        val questionsToUse = if (effectiveMode == ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT || !isSubscribed) {
            filtered.take(FREE_ASSESSMENT_QUESTION_LIMIT)
        } else {
            filtered
        }

        if (questionsToUse.isEmpty()) {
            _statusMessage.value = "Exam questions are not installed yet. The application is in feature review mode."
            return
        }

        _simulationQuestions.value = questionsToUse
        _currentQuestionIndex.value = 0
        _userAnswers.value = emptyMap()
        _flaggedIndices.value = emptySet()
        _struckOptions.value = emptyMap()
        _optionSwitchCounts.value = emptyMap()

        val timeLimit = if (effectiveMode == ExamMode.FULL_SIMULATION && isSubscribed) {
            repository.currentExam.value.durationMinutes * 60
        } else {
            questionsToUse.size * 90 // 1.5 min per question (e.g. 75 min for 50 questions)
        }
        _remainingSeconds.value = timeLimit
        simulationTimeLimitSeconds = timeLimit
        simulationStartedAtMillis = System.currentTimeMillis()
        _isTimerPaused.value = false

        startTimer()
        navigateTo(AppScreen.SIMULATION_ACTIVE)
    }

    private fun startTimer() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (_remainingSeconds.value > 0) {
                delay(1000)
                if (!_isTimerPaused.value) {
                    _remainingSeconds.value -= 1
                }
            }
            if (_remainingSeconds.value <= 0 && _currentScreen.value == AppScreen.SIMULATION_ACTIVE) {
                finishSimulation()
            }
        }
    }

    fun pauseTimer() {
        _isTimerPaused.value = true
        timerJob?.cancel()
    }

    fun resumeTimer() {
        if (_isTimerPaused.value) {
            _isTimerPaused.value = false
            startTimer()
        }
    }

    fun selectOption(questionIndex: Int, optionIndex: Int) {
        val current = _userAnswers.value.toMutableMap()
        val previous = current[questionIndex]
        if (previous != null && previous != optionIndex) {
            val switches = _optionSwitchCounts.value.toMutableMap()
            switches[questionIndex] = (switches[questionIndex] ?: 0) + 1
            _optionSwitchCounts.value = switches
        }
        current[questionIndex] = optionIndex
        _userAnswers.value = current
    }

    fun toggleFlagQuestion(questionIndex: Int) {
        val current = _flaggedIndices.value.toMutableSet()
        if (current.contains(questionIndex)) {
            current.remove(questionIndex)
        } else {
            current.add(questionIndex)
        }
        _flaggedIndices.value = current
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
    }

    fun goToQuestion(index: Int) {
        if (index in 0 until _simulationQuestions.value.size) {
            _currentQuestionIndex.value = index
        }
    }

    fun nextQuestion() {
        if (_currentQuestionIndex.value < _simulationQuestions.value.size - 1) {
            _currentQuestionIndex.value += 1
        }
    }

    fun previousQuestion() {
        if (_currentQuestionIndex.value > 0) {
            _currentQuestionIndex.value -= 1
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

        val totalSwitches = _optionSwitchCounts.value.values.sum()
        val elapsedSeconds = ((System.currentTimeMillis() - simulationStartedAtMillis) / 1000L)
            .coerceAtLeast(1L).coerceAtMost(Int.MAX_VALUE.toLong()).toInt()

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
            domainScores = domainScores
        )

        repository.recordSession(session, optionSwitchCount = totalSwitches)
        refreshStressMetrics()
        _lastCompletedSession.value = session
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
            _currentCardIndex.value = (_currentCardIndex.value + 1) % list.size
        }
    }

    fun prevFlashcard() {
        _isCardFlipped.value = false
        val list = repository.flashcards.value
        if (list.isNotEmpty()) {
            _currentCardIndex.value = if (_currentCardIndex.value > 0) _currentCardIndex.value - 1 else list.size - 1
        }
    }

    fun flipFlashcard() {
        _isCardFlipped.value = !_isCardFlipped.value
    }

    fun rateFlashcard(boxLevel: Int) {
        val list = repository.flashcards.value
        if (list.isNotEmpty()) {
            val current = list[_currentCardIndex.value]
            repository.updateFlashcardBox(current.id, boxLevel)
            nextFlashcard()
        }
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

    override fun onCleared() {
        super.onCleared()
        speechManager.shutdown()
        timerJob?.cancel()
    }
}
