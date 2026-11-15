package com.example

import android.app.Application
import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.auth.SharedAuthManager
import com.example.data.EmbeddedExamBank
import com.example.data.ExamCatalog
import com.example.data.ExamRepository
import com.example.data.local.ActiveExamAttemptEntity
import com.example.data.local.CertDatabase
import com.example.model.ExamMode
import com.example.model.Question
import com.example.model.QuestionDifficulty
import com.example.model.SourceCitation
import com.example.network.CertMasterFirebaseSyncClient
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.setMain
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class CscPart1OfflineTest {

    private lateinit var application: Application
    private lateinit var context: Context

    @Before
    fun setup() = runBlocking(Dispatchers.IO) {
        Dispatchers.setMain(Dispatchers.Unconfined)
        application = ApplicationProvider.getApplicationContext()
        context = application
        CertDatabase.getInstance(context).clearAllTables()
    }

    @After
    fun tearDown() = runBlocking(Dispatchers.IO) {
        CertDatabase.getInstance(context).clearAllTables()
        Dispatchers.resetMain()
    }

    private suspend fun awaitCondition(timeoutMs: Long = 3000L, predicate: suspend () -> Boolean) {
        val deadline = System.currentTimeMillis() + timeoutMs
        while (!predicate() && System.currentTimeMillis() < deadline) {
            delay(25)
        }
        assertTrue("Timed out waiting for asynchronous state update", predicate())
    }

    private fun buildSyntheticCscQuestions(): List<Question> = listOf(
        Question(
            id = "csc_test_q1",
            examId = "csc-part-1",
            domainId = "csc-d1",
            domainName = "Canadian Capital Markets",
            questionText = "Synthetic test question 1: Which entity oversees securities regulation across Canadian provinces?",
            options = listOf("CSA", "FDIC", "SEC", "ECB"),
            correctIndex = 0,
            explanation = "Synthetic test explanation 1.",
            citation = SourceCitation("Synthetic Guide", "Ch. 1", "CSC Part 1"),
            difficulty = QuestionDifficulty.EASY
        ),
        Question(
            id = "csc_test_q2",
            examId = "csc-part-1",
            domainId = "csc-d1",
            domainName = "Canadian Capital Markets",
            questionText = "Synthetic test question 2: What is a primary market transaction?",
            options = listOf("Secondary broker cross", "New issue distribution", "Margin call", "Short cover"),
            correctIndex = 1,
            explanation = "Synthetic test explanation 2.",
            citation = SourceCitation("Synthetic Guide", "Ch. 2", "CSC Part 1"),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "csc_test_q3",
            examId = "csc-part-1",
            domainId = "csc-d2",
            domainName = "Fixed Income & Equities",
            questionText = "Synthetic test question 3: How do bond prices respond to rising market yields?",
            options = listOf("Prices rise", "Prices remain fixed", "Prices fall", "Coupon resets daily"),
            correctIndex = 2,
            explanation = "Synthetic test explanation 3.",
            citation = SourceCitation("Synthetic Guide", "Ch. 3", "CSC Part 1"),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "csc_test_q4",
            examId = "csc-part-1",
            domainId = "csc-d2",
            domainName = "Fixed Income & Equities",
            questionText = "Synthetic test question 4: Which order guarantees immediate execution at best available price?",
            options = listOf("Limit order", "Stop order", "Market order", "Fill-or-kill limit"),
            correctIndex = 2,
            explanation = "Synthetic test explanation 4.",
            citation = SourceCitation("Synthetic Guide", "Ch. 4", "CSC Part 1"),
            difficulty = QuestionDifficulty.EASY
        ),
        Question(
            id = "csc_test_q5",
            examId = "csc-part-1",
            domainId = "csc-d3",
            domainName = "Financial Analysis",
            questionText = "Synthetic test question 5: Which statement summarizes assets, liabilities, and equity?",
            options = listOf("Income statement", "Statement of financial position", "Cash flow statement", "Proxy circular"),
            correctIndex = 1,
            explanation = "Synthetic test explanation 5.",
            citation = SourceCitation("Synthetic Guide", "Ch. 5", "CSC Part 1"),
            difficulty = QuestionDifficulty.HARD
        )
    )

    @Test
    fun offlineBuild_hasZeroFirebaseOrCloudConfig() = runBlocking(Dispatchers.IO) {
        assertEquals("csc-part-1", BuildConfig.TARGET_EXAM_ID)
        assertEquals("", SharedAuthManager.FIREBASE_PROJECT_ID)
        assertEquals("", SharedAuthManager.FIRESTORE_DATABASE_ID)
        assertEquals("", CertMasterFirebaseSyncClient.FIREBASE_PROJECT_ID)
        assertEquals("", CertMasterFirebaseSyncClient.FIRESTORE_DATABASE_ID)

        val authManager = SharedAuthManager(context)
        assertFalse(authManager.isFirebaseInitialized())
        assertEquals("", authManager.getActiveUserId())
        assertTrue(authManager.signInWithGoogle(context).isFailure)

        val syncClient = CertMasterFirebaseSyncClient(context)
        assertFalse(syncClient.isFirestoreAvailable())
    }

    @Test
    fun repository_loadsBundled474PracticeBank_andFailsClosedWhenBankAbsent() = runBlocking(Dispatchers.IO) {
        val missingError = runCatching {
            EmbeddedExamBank.loadWithMetadata(context, "missing-exam-id")
        }.exceptionOrNull()
        assertTrue("Missing asset must fail closed", missingError is IllegalStateException)

        val unattachedRepo = ExamRepository(context = null, database = null)
        try {
            assertTrue("Expected empty bank when no assets context is attached", unattachedRepo.questions.value.isEmpty())
        } finally {
            unattachedRepo.shutdown()
        }

        val db = Room.inMemoryDatabaseBuilder(context, CertDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        var repo: ExamRepository? = null
        try {
            val repository = ExamRepository(context = context, database = db)
            repo = repository
            awaitCondition {
                repository.userProfile.value.userId == "local_csc_part_1"
            }

            assertEquals("csc-part-1", repository.currentExam.value.id)
            assertEquals(60, repository.currentExam.value.passingScorePercent)
            assertEquals(474, repository.questions.value.size)
            assertEquals(474, repository.bankCoverageAudit.value.practiceEligibleCount)
            assertEquals(474, repository.bankCoverageAudit.value.assessmentEligibleCount)
            assertEquals(0, repository.bankCoverageAudit.value.reservedFullExamCount)
            assertEquals(4, repository.bankCoverageAudit.value.simulationPapersCount)
            assertEquals(4, repository.bankMetadata.value.simulationPapers.size)
            assertEquals(
                listOf("csc1_exam_3", "csc1_exam_4", "csc1_exam_5", "csc1_exam_6"),
                repository.bankMetadata.value.simulationPapers.map { it.id }
            )
            repository.bankMetadata.value.simulationPapers.forEach { paper ->
                assertEquals(120, paper.durationMinutes)
                assertEquals(100, paper.questionIds.size)
                assertEquals(100, paper.questionIds.distinct().size)
            }
            assertEquals(9, repository.bankCoverageAudit.value.domainsCount)
            assertEquals(43, repository.bankCoverageAudit.value.topicsCount)
            assertEquals(0, repository.bankCoverageAudit.value.unmappedTopicQuestionCount)
            assertEquals(400, repository.bankCoverageAudit.value.missingObjectiveCount)
            assertEquals(400, repository.bankCoverageAudit.value.missingOptionAnalysisCount)
            assertEquals(454, repository.bankCoverageAudit.value.missingExplicitDifficultyCount)
            assertTrue(repository.bankCoverageAudit.value.usesSyllabusWeights)
            assertEquals(
                mapOf(
                    "csc-d1" to 15,
                    "csc-d2" to 13,
                    "csc-d3" to 12,
                    "csc-d4" to 11,
                    "csc-d5" to 13,
                    "csc-d6" to 10,
                    "csc-d7" to 10,
                    "csc-d8" to 8,
                    "csc-d9" to 8
                ),
                repository.bankMetadata.value.syllabusWeights
            )
            assertTrue("Expected no CISSP flashcards in CSC Part 1", repository.flashcards.value.isEmpty())
            assertTrue("Expected no CISSP study guides in CSC Part 1", repository.sources.value.isEmpty())
            assertTrue("Expected no CISSP audio briefings in CSC Part 1", repository.audioOverviews.value.isEmpty())
            assertFalse(repository.backendConfig.value.isOnline)
            assertFalse(repository.backendConfig.value.isConnected)
            assertEquals(0, repository.readinessReport.value.readinessPercent)
            assertEquals(0, repository.readinessReport.value.passProbabilityPercent)
            assertTrue(repository.getDomainStressMetricsList().isEmpty())
        } finally {
            repo?.awaitPendingWritesForTesting()
            repo?.shutdown()
            db.close()
        }
    }

    @Test
    fun bundledBank_supportsFourFullTimedSimulationsWeightedAssessmentAndTopicDrills() = runBlocking(Dispatchers.IO) {
        val viewModel = ExamViewModel(application)
        try {
            // 1. Unknown paper ID fails safe without launching a session
            viewModel.startSimulationPaper("nonexistent_paper")
            assertTrue(viewModel.simulationQuestions.value.isEmpty())

            // 2. Selecting Exam 6 launches exact 100-question 120-minute strict Exam 1 simulation
            viewModel.startSimulationPaper("csc1_exam_6")
            assertEquals(AppScreen.SIMULATION_ACTIVE, viewModel.currentScreen.value)
            assertEquals(ExamMode.FULL_SIMULATION, viewModel.activeMode.value)
            assertEquals(100, viewModel.simulationQuestions.value.size)
            assertEquals("csc1_p6_001", viewModel.simulationQuestions.value.first().id)
            assertEquals("csc1_p6_100", viewModel.simulationQuestions.value.last().id)
            assertEquals(120 * 60, viewModel.remainingSeconds.value)
            assertEquals("CSC Practice Exam 6 (Exam 1 Style)", viewModel.activeSimulationPaperTitle.value)

            // Strict exam conditions suppress immediate answer feedback during simulation
            viewModel.selectOption(0, viewModel.simulationQuestions.value[0].correctIndex)
            viewModel.checkPracticeAnswer(0)
            assertNull("Full simulation must not reveal immediate check feedback", viewModel.currentPracticeFeedback.value)

            viewModel.finishSimulation()
            val examResult = viewModel.lastCompletedSession.value
            assertNotNull(examResult)
            assertEquals(AppScreen.SESSION_RESULT, viewModel.currentScreen.value)
            assertEquals(100, examResult!!.totalQuestions)
            assertEquals(9, examResult.domainScores.size)
            assertEquals("csc1_exam_6", viewModel.lastSimulationPaperId.value)

            // 3. Initial Assessment spans all 9 weighted domains
            viewModel.startSimulation(ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT)
            val sampled = viewModel.simulationQuestions.value
            assertEquals(54, sampled.size)
            assertEquals(54, sampled.map { it.id }.distinct().size)
            assertEquals(viewModel.bankMetadata.value.diagnosticQuestionIds, sampled.map { it.id })
            val perDomain = sampled.groupingBy { it.domainId }.eachCount()
            assertEquals(9, perDomain.size)
            viewModel.abandonSimulation()

            // 4. Topic-specific adaptive practice works directly on any of the 43 bundled topics
            val targetTopic = viewModel.topicMasteryList.value.first()
            viewModel.startAdaptivePractice(topicFilterKey = targetTopic.topicKey)
            val topicDrill = viewModel.simulationQuestions.value
            assertTrue("Expected questions for topic ${targetTopic.topicKey}", topicDrill.isNotEmpty())
            assertTrue(topicDrill.all { com.example.domain.AdaptivePracticeEngine.resolveTopic(it).topicKey == targetTopic.topicKey })
            viewModel.abandonSimulation()
        } finally {
            viewModel.closeForTesting()
        }
    }

    @Test
    fun dedicatedDiagnostic_preservesOrderAnswersBaselineAndRetakeHistoryAfterRestart() = runBlocking(Dispatchers.IO) {
        val expected = EmbeddedExamBank.loadWithMetadata(context, "csc-part-1").metadata.diagnosticQuestionIds
        assertEquals((1..54).map { "csc1_dx_%03d".format(it) }, expected)
        var baselineId = ""
        val vm1 = ExamViewModel(application)
        try {
            vm1.startSimulation(ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT)
            assertEquals(expected, vm1.simulationQuestions.value.map { it.id })
            vm1.selectOption(0, vm1.simulationQuestions.value.first().correctIndex)
            vm1.nextQuestion()
            vm1.pauseAndExitToDashboard()
            awaitCondition { vm1.savedActiveAttempt.value?.isPaused == true }
        } finally { vm1.closeForTesting() }
        val vm2 = ExamViewModel(application)
        try {
            awaitCondition { vm2.savedActiveAttempt.value != null }
            assertTrue(vm2.resumeSavedSimulation())
            assertEquals(expected, vm2.simulationQuestions.value.map { it.id })
            assertEquals(1, vm2.currentQuestionIndex.value)
            assertEquals(vm2.simulationQuestions.value.first().correctIndex, vm2.userAnswers.value[0])
            vm2.finishSimulation()
            awaitCondition { vm2.initialBaselineSession.value != null && vm2.sessions.value.size == 1 }
            baselineId = vm2.initialBaselineSession.value!!.sessionId
            vm2.startSimulation(ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT, requestedCount = 20)
            assertEquals("Dedicated diagnostic must never silently shrink to a sampled subset", expected, vm2.simulationQuestions.value.map { it.id })
            vm2.simulationQuestions.value.forEachIndexed { idx, q -> vm2.selectOption(idx, q.correctIndex) }
            vm2.finishSimulation()
            awaitCondition { vm2.sessions.value.size == 2 }
            assertEquals(baselineId, vm2.initialBaselineSession.value!!.sessionId)
        } finally { vm2.closeForTesting() }
        val vm3 = ExamViewModel(application)
        try {
            awaitCondition { vm3.sessions.value.size == 2 }
            assertEquals(baselineId, vm3.initialBaselineSession.value!!.sessionId)
            assertEquals(1, vm3.sessions.value.count { it.isInitialBaseline })
        } finally { vm3.closeForTesting() }
    }

    @Test
    fun allBundledPapers_preserveExactOrderTimerAndSuppressPracticeFeedback() = runBlocking(Dispatchers.IO) {
        val vm = ExamViewModel(application)
        try {
            val papers = vm.bankMetadata.value.simulationPapers
            assertEquals(4, papers.size)
            for (paper in papers) {
                vm.startSimulationPaper(paper.id)
                assertEquals(paper.questionIds, vm.simulationQuestions.value.map { it.id })
                assertEquals(100, vm.simulationQuestions.value.size)
                assertEquals(7200, vm.remainingSeconds.value)
                vm.selectOption(0, vm.simulationQuestions.value.first().correctIndex)
                vm.checkPracticeAnswer(0)
                assertNull(vm.currentPracticeFeedback.value)
                vm.abandonSimulation()
            }
            val json = context.assets.open("exams/csc-part-1.json").bufferedReader().use { it.readText() }
            val bad = org.json.JSONObject(json).put("diagnosticQuestionIds", org.json.JSONArray(listOf("missing")))
            assertTrue(runCatching { EmbeddedExamBank.parseWithMetadata(bad.toString(), "csc-part-1") }.isFailure)
            val duplicate = org.json.JSONObject(json).put("diagnosticQuestionIds", org.json.JSONArray(listOf("csc1_dx_001", "csc1_dx_001")))
            assertTrue(runCatching { EmbeddedExamBank.parseWithMetadata(duplicate.toString(), "csc-part-1") }.isFailure)
        } finally { vm.closeForTesting() }
    }

    @Test
    fun bundledTimedPaper_resumesExactPaperAndCanBeRetakenAfterCompletion() = runBlocking(Dispatchers.IO) {
        val paper = EmbeddedExamBank.loadWithMetadata(context, "csc-part-1").metadata.simulationPapers.first { it.id == "csc1_exam_4" }
        val vm1 = ExamViewModel(application)
        try {
            vm1.startSimulationPaper(paper.id)
            vm1.selectOption(0, vm1.simulationQuestions.value.first().correctIndex)
            vm1.nextQuestion()
            vm1.pauseAndExitToDashboard()
            awaitCondition { vm1.savedActiveAttempt.value?.isPaused == true }
        } finally { vm1.closeForTesting() }
        val vm2 = ExamViewModel(application)
        try {
            awaitCondition { vm2.savedActiveAttempt.value != null }
            assertTrue(vm2.resumeSavedSimulation())
            assertEquals(paper.questionIds, vm2.simulationQuestions.value.map { it.id })
            assertEquals(paper.title, vm2.activeSimulationPaperTitle.value)
            assertEquals(1, vm2.currentQuestionIndex.value)
            assertTrue(vm2.remainingSeconds.value in 7195..7200)
            vm2.finishSimulation()
            awaitCondition { vm2.sessions.value.size == 1 }
            assertEquals(paper.id, vm2.lastSimulationPaperId.value)
            vm2.startSimulationPaper(vm2.lastSimulationPaperId.value!!)
            assertEquals(paper.questionIds, vm2.simulationQuestions.value.map { it.id })
            assertTrue(vm2.userAnswers.value.isEmpty())
            assertEquals(7200, vm2.remainingSeconds.value)
            vm2.abandonSimulation()
        } finally { vm2.closeForTesting() }
    }

    @Test
    fun practiceOnlyBankWithoutSimulationPapers_stillBlocksFullSimulation() = runBlocking(Dispatchers.IO) {
        val viewModel = ExamViewModel(application)
        try {
            val practiceOnlyItem = buildSyntheticCscQuestions().first().copy(
                questionPool = com.example.model.QuestionPool.PRACTICE
            )
            viewModel.repositoryForTesting().setQuestionsForTesting(
                testQuestions = listOf(practiceOnlyItem),
                metadata = com.example.model.EmbeddedBankMetadata(examId = "csc-part-1")
            )
            viewModel.startSimulation(ExamMode.FULL_SIMULATION)
            assertTrue("Practice-only bank without simulationPapers must block FULL_SIMULATION", viewModel.simulationQuestions.value.isEmpty())
            assertTrue(viewModel.statusMessage.value?.contains("coming soon", ignoreCase = true) == true)
        } finally {
            viewModel.closeForTesting()
        }
    }

    @Test
    fun embeddedExamBank_validatesSchemaExamIdAndDuplicateIds() {
        val validJson = """
            {
              "schemaVersion": 1,
              "examId": "csc-part-1",
              "questions": [
                {
                  "id": "q_1",
                  "domainId": "csc-d1",
                  "domainName": "Capital Markets",
                  "questionText": "Valid question?",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctIndex": 1,
                  "explanation": "Explanation here.",
                  "difficulty": "MEDIUM",
                  "citation": {
                    "title": "CSC Volume 1",
                    "sectionOrPage": "Ch. 1",
                    "standardOrFramework": "CSC Part 1"
                  }
                }
              ]
            }
        """.trimIndent()
        val parsed = EmbeddedExamBank.parse(validJson, "csc-part-1")
        assertEquals(1, parsed.size)
        assertEquals("q_1", parsed.first().id)

        val mismatchJson = validJson.replace("\"csc-part-1\"", "\"cissp\"")
        val mismatchFailed = runCatching { EmbeddedExamBank.parse(mismatchJson, "csc-part-1") }.isFailure
        assertTrue(mismatchFailed)

        val duplicateIdJson = """
            {
              "schemaVersion": 1,
              "examId": "csc-part-1",
              "questions": [
                {
                  "id": "dup_1",
                  "domainId": "csc-d1",
                  "domainName": "Capital Markets",
                  "questionText": "Q1?",
                  "options": ["A", "B"],
                  "correctIndex": 0,
                  "explanation": "E1",
                  "citation": {"title": "T", "sectionOrPage": "S", "standardOrFramework": "F"}
                },
                {
                  "id": "dup_1",
                  "domainId": "csc-d1",
                  "domainName": "Capital Markets",
                  "questionText": "Q2?",
                  "options": ["A", "B"],
                  "correctIndex": 1,
                  "explanation": "E2",
                  "citation": {"title": "T", "sectionOrPage": "S", "standardOrFramework": "F"}
                }
              ]
            }
        """.trimIndent()
        val duplicateFailed = runCatching { EmbeddedExamBank.parse(duplicateIdJson, "csc-part-1") }.isFailure
        assertTrue(duplicateFailed)
    }

    @Test
    fun simulationScoringTimingAndDomainBreakdown_workCompletelyOffline() = runBlocking(Dispatchers.IO) {
        val viewModel = ExamViewModel(application)
        try {
            val testQuestions = buildSyntheticCscQuestions()
            viewModel.repositoryForTesting().setQuestionsForTesting(testQuestions)

            viewModel.startSimulation(ExamMode.FULL_SIMULATION)
            assertEquals(AppScreen.SIMULATION_ACTIVE, viewModel.currentScreen.value)
            assertEquals(5, viewModel.simulationQuestions.value.size)
            assertEquals(120 * 60, viewModel.remainingSeconds.value)

            // Answer 3 out of 5 correctly (60%, exact CSC Part 1 passing threshold!)
            viewModel.simulationQuestions.value.forEachIndexed { idx, q ->
                viewModel.goToQuestion(idx)
                val wrongIdx = (q.correctIndex + 1) % q.options.size
                if (idx < 3) {
                    // Exercise option switch tracking on Q0 before choosing correct option
                    if (idx == 0) {
                        viewModel.selectOption(idx, wrongIdx)
                        viewModel.toggleStrikeOption(idx, wrongIdx)
                    }
                    viewModel.selectOption(idx, q.correctIndex)
                } else {
                    viewModel.selectOption(idx, wrongIdx)
                }
                if (idx == 4) {
                    viewModel.toggleFlagQuestion(idx)
                }
            }

            viewModel.finishSimulation()

            val result = viewModel.lastCompletedSession.value
            assertNotNull(result)
            assertEquals(AppScreen.SESSION_RESULT, viewModel.currentScreen.value)
            assertEquals(60, result!!.scorePercent)
            assertTrue("60% should pass CSC Part 1 threshold", result.isPassed)
            assertEquals(5, result.totalQuestions)
            assertTrue(result.durationSeconds >= 1)
            assertEquals(setOf(4), result.flaggedIndices)
            assertEquals(3, result.domainScores.size)
            assertNull(viewModel.savedActiveAttempt.value)

            awaitCondition {
                CertDatabase.getInstance(context).simulationScoreDao().getScoreCount("csc-part-1") == 1 &&
                    CertDatabase.getInstance(context).activeExamAttemptDao().getAttemptForExam("csc-part-1") == null
            }
            assertTrue(viewModel.readinessReport.value.readinessPercent > 0)
            assertTrue(viewModel.domainStressMetrics.value.isNotEmpty())
        } finally {
            viewModel.closeForTesting()
        }
    }

    @Test
    fun inProgressAttemptCompletedSessionFlashcardsAndNotes_surviveAppRestart() = runBlocking(Dispatchers.IO) {
        val testQuestions = buildSyntheticCscQuestions()

        // Launch 1: Create study note, create & rate flashcard, start simulation, pause & exit to dashboard
        val vm1 = ExamViewModel(application)
        try {
            vm1.repositoryForTesting().setQuestionsForTesting(testQuestions)
            vm1.addSourceDoc(
                title = "Chapter 1 Summary",
                summary = "Role of Canadian financial markets",
                takeaways = listOf("Primary vs secondary markets", "IIROC / CIRO oversight"),
                content = "Offline study notes persisted in Room.",
                domainId = ""
            )
            vm1.addFlashcard(
                frontPrompt = "What is the CSC Part 1 passing grade?",
                backAnswer = "60%",
                keyRule = "CSC threshold = 60%"
            )
            awaitCondition { vm1.flashcards.value.size == 1 && vm1.sources.value.size == 1 }
            vm1.rateFlashcard(boxLevel = 5)

            vm1.startSimulation(ExamMode.FULL_SIMULATION)
            val q0 = vm1.simulationQuestions.value[0]
            val q1 = vm1.simulationQuestions.value[1]
            val orderedIdsBeforeRestart = vm1.simulationQuestions.value.map { it.id }

            vm1.selectOption(0, q0.correctIndex)
            vm1.toggleFlagQuestion(0)
            vm1.nextQuestion()
            vm1.toggleStrikeOption(1, (q1.correctIndex + 1) % q1.options.size)
            vm1.pauseAndExitToDashboard()

            assertEquals(AppScreen.DASHBOARD, vm1.currentScreen.value)

            awaitCondition {
                val attempt = CertDatabase.getInstance(context).activeExamAttemptDao().getAttemptForExam("csc-part-1")
                val cards = CertDatabase.getInstance(context).flashcardDao().getFlashcardsByExam("csc-part-1").first()
                val srcs = CertDatabase.getInstance(context).studySourceDao().getSourcesByExam("csc-part-1").first()
                attempt != null && attempt.isPaused && cards.firstOrNull()?.boxLevel == 5 && srcs.size == 1
            }

            // Finish a second simulation on another session or inspect active attempt first
            assertEquals(orderedIdsBeforeRestart, vm1.savedActiveAttempt.value!!.parseQuestionIds())
        } finally {
            vm1.closeForTesting()
        }

        // Launch 2 (Simulated App Restart on same persisted Room DB):
        val vm2 = ExamViewModel(application)
        try {
            vm2.repositoryForTesting().setQuestionsForTesting(testQuestions)
            awaitCondition {
                vm2.savedActiveAttempt.value != null &&
                    vm2.flashcards.value.size == 1 &&
                    vm2.sources.value.size == 1
            }

            assertEquals(5, vm2.flashcards.value.first().boxLevel)
            assertEquals("Chapter 1 Summary", vm2.sources.value.first().title)

            val resumed = vm2.resumeSavedSimulation()
            assertTrue(resumed)
            assertEquals(AppScreen.SIMULATION_ACTIVE, vm2.currentScreen.value)
            assertEquals(1, vm2.currentQuestionIndex.value)
            assertEquals(testQuestions.first { it.id == vm2.simulationQuestions.value[0].id }.correctIndex, vm2.userAnswers.value[0])
            assertTrue(vm2.flaggedIndices.value.contains(0))
            assertTrue(vm2.struckOptions.value[1]?.isNotEmpty() == true)

            // Now complete this resumed exam and verify completed session survives Launch 3!
            vm2.simulationQuestions.value.forEachIndexed { idx, q ->
                vm2.selectOption(idx, q.correctIndex)
            }
            vm2.finishSimulation()

            awaitCondition {
                CertDatabase.getInstance(context).simulationScoreDao().getScoreCount("csc-part-1") == 1 &&
                    CertDatabase.getInstance(context).activeExamAttemptDao().getAttemptForExam("csc-part-1") == null
            }
        } finally {
            vm2.closeForTesting()
        }

        // Launch 3: Verify completed session + question IDs + domain breakdown restore cleanly
        val vm3 = ExamViewModel(application)
        try {
            vm3.repositoryForTesting().setQuestionsForTesting(testQuestions)
            awaitCondition { vm3.sessions.value.size == 1 }
            val restoredSession = vm3.sessions.value.first()
            assertEquals(100, restoredSession.scorePercent)
            assertTrue(restoredSession.isPassed)
            assertEquals(5, restoredSession.questionIds.size)
            assertEquals(5, restoredSession.userAnswers.size)

            vm3.openHistoricalSession(restoredSession)
            assertEquals(AppScreen.SESSION_RESULT, vm3.currentScreen.value)
            assertEquals(5, vm3.simulationQuestions.value.size)
        } finally {
            vm3.closeForTesting()
        }
    }

    @Test
    fun abandonSimulation_clearsSavedActiveAttemptFromRoom() = runBlocking(Dispatchers.IO) {
        val viewModel = ExamViewModel(application)
        try {
            viewModel.repositoryForTesting().setQuestionsForTesting(buildSyntheticCscQuestions())
            viewModel.startSimulation(ExamMode.DOMAIN_PRACTICE, domainFilterId = "csc-d1")
            awaitCondition {
                CertDatabase.getInstance(context).activeExamAttemptDao().getAttemptForExam("csc-part-1") != null
            }

            viewModel.abandonSimulation()
            assertNull(viewModel.savedActiveAttempt.value)
            assertTrue(viewModel.simulationQuestions.value.isEmpty())
            awaitCondition {
                CertDatabase.getInstance(context).activeExamAttemptDao().getAttemptForExam("csc-part-1") == null
            }
        } finally {
            viewModel.closeForTesting()
        }
    }

    @Test
    fun offlineGuardrails_blockCloudRoutesAndExamSwitchingGracefully() = runBlocking(Dispatchers.IO) {
        val viewModel = ExamViewModel(application)
        try {
            viewModel.sendAIPrompt("Explain bond duration")
            assertEquals("AI tutor requires internet and is unavailable in this edition.", viewModel.statusMessage.value)

            viewModel.selectExam("cissp")
            assertEquals("csc-part-1", viewModel.currentExam.value.id)
            assertEquals("This offline edition contains one certification.", viewModel.statusMessage.value)
        } finally {
            viewModel.closeForTesting()
        }
    }
}

