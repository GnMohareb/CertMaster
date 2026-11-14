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

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class CscPart1OfflineTest {

    private lateinit var application: Application
    private lateinit var context: Context

    @Before
    fun setup() {
        application = ApplicationProvider.getApplicationContext()
        context = application
        CertDatabase.getInstance(context).clearAllTables()
    }

    @After
    fun tearDown() {
        CertDatabase.getInstance(context).clearAllTables()
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
    fun offlineBuild_hasZeroFirebaseOrCloudConfig() = runBlocking {
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
    fun repository_failsClosedWithNoCrossExamLeakageWhenQuestionBankAbsent() = runBlocking {
        val db = Room.inMemoryDatabaseBuilder(context, CertDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        try {
            val repo = ExamRepository(context = context, database = db)
            awaitCondition {
                repo.userProfile.value.userId == "local_csc_part_1"
            }

            assertEquals("csc-part-1", repo.currentExam.value.id)
            assertEquals(60, repo.currentExam.value.passingScorePercent)
            assertTrue("Expected empty question bank before import", repo.questions.value.isEmpty())
            assertTrue("Expected no CISSP flashcards in CSC Part 1", repo.flashcards.value.isEmpty())
            assertTrue("Expected no CISSP study guides in CSC Part 1", repo.sources.value.isEmpty())
            assertTrue("Expected no CISSP audio briefings in CSC Part 1", repo.audioOverviews.value.isEmpty())
            assertFalse(repo.backendConfig.value.isOnline)
            assertFalse(repo.backendConfig.value.isConnected)
            assertEquals(0, repo.readinessReport.value.readinessPercent)
            assertEquals(0, repo.readinessReport.value.passProbabilityPercent)
            assertTrue(repo.getDomainStressMetricsList().isEmpty())
        } finally {
            db.close()
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
    fun simulationScoringTimingAndDomainBreakdown_workCompletelyOffline() = runBlocking {
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
            viewModel.speechManager.shutdown()
        }
    }

    @Test
    fun inProgressAttemptCompletedSessionFlashcardsAndNotes_surviveAppRestart() = runBlocking {
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
            vm1.speechManager.shutdown()
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
            vm2.speechManager.shutdown()
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
            vm3.speechManager.shutdown()
        }
    }

    @Test
    fun abandonSimulation_clearsSavedActiveAttemptFromRoom() = runBlocking {
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
            viewModel.speechManager.shutdown()
        }
    }

    @Test
    fun offlineGuardrails_blockCloudRoutesAndExamSwitchingGracefully() {
        val viewModel = ExamViewModel(application)
        try {
            viewModel.sendAIPrompt("Explain bond duration")
            assertEquals("AI tutor requires internet and is unavailable in this edition.", viewModel.statusMessage.value)

            viewModel.selectExam("cissp")
            assertEquals("csc-part-1", viewModel.currentExam.value.id)
            assertEquals("This offline edition contains one certification.", viewModel.statusMessage.value)
        } finally {
            viewModel.speechManager.shutdown()
        }
    }
}
