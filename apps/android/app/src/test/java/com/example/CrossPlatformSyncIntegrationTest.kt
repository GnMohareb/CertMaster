package com.example

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.ExamCatalog
import com.example.data.ExamRepository
import com.example.data.local.CertDatabase
import com.example.data.local.FlashcardEntity
import com.example.domain.AuthoritativeMetricsEngine
import com.example.model.DomainScore
import com.example.model.ExamMode
import com.example.model.ExamSession
import com.example.model.FlashcardStatus
import com.example.model.SubStatus
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * Integration tests verifying that a student using both the CertMaster Web Platform
 * and the CertMaster Android application sees consistent data, identical authoritative
 * calculations, offline caching with retry queueing, and deterministic conflict resolution.
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class CrossPlatformSyncIntegrationTest {

    private lateinit var context: Context
    private lateinit var database: CertDatabase
    private lateinit var repository: ExamRepository

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        database = Room.inMemoryDatabaseBuilder(context, CertDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        repository = ExamRepository(context = context, database = database)
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun authoritativeCalculations_matchWebPlatformFormulasBitForBit() {
        // 1. Confident Master: scorePct >= 85 && avgLatency < 40 && totalSwitches <= 2 -> stress = 35
        val confident = AuthoritativeMetricsEngine.classifyBehavioralArchetype(
            scorePct = 90,
            avgLatencySec = 32,
            totalSwitches = 1,
            totalEliminations = 8,
            totalQuestions = 10
        )
        assertEquals("Confident Master", confident.archetype)
        assertEquals(35, confident.cognitiveStressBaseline)
        assertEquals(0.27, confident.distractorEliminationRate, 0.001)
        assertEquals(0.1, confident.optionSwitchCountAvg, 0.001)

        // 2. Deliberate Strategist: totalEliminations >= 6 && scorePct >= 70 -> stress = 54
        val strategist = AuthoritativeMetricsEngine.classifyBehavioralArchetype(
            scorePct = 80,
            avgLatencySec = 42,
            totalSwitches = 2,
            totalEliminations = 7,
            totalQuestions = 10
        )
        assertEquals("Deliberate Strategist", strategist.archetype)
        assertEquals(54, strategist.cognitiveStressBaseline)

        // 3. Fast Guesser: avgLatency < 22 && scorePct < 70 -> stress = 72
        val fastGuesser = AuthoritativeMetricsEngine.classifyBehavioralArchetype(
            scorePct = 50,
            avgLatencySec = 15,
            totalSwitches = 1,
            totalEliminations = 1,
            totalQuestions = 10
        )
        assertEquals("Fast Guesser", fastGuesser.archetype)
        assertEquals(72, fastGuesser.cognitiveStressBaseline)

        // 4. Analytical Hesitator: avgLatency >= 45 || totalSwitches >= 4 -> stress = 68
        val hesitator = AuthoritativeMetricsEngine.classifyBehavioralArchetype(
            scorePct = 74,
            avgLatencySec = 54,
            totalSwitches = 5,
            totalEliminations = 4,
            totalQuestions = 10
        )
        assertEquals("Analytical Hesitator", hesitator.archetype)
        assertEquals(68, hesitator.cognitiveStressBaseline)

        // 5. Methodical Verifier: otherwise -> stress = 50
        val verifier = AuthoritativeMetricsEngine.classifyBehavioralArchetype(
            scorePct = 75,
            avgLatencySec = 35,
            totalSwitches = 2,
            totalEliminations = 3,
            totalQuestions = 10
        )
        assertEquals("Methodical Verifier", verifier.archetype)
        assertEquals(50, verifier.cognitiveStressBaseline)

        // 6. Simulation Behavioral Stress Formula: min(100, max(30, 50 + totalSwitches * 5 - (passed ? 15 : 0)))
        assertEquals(45, AuthoritativeMetricsEngine.calculateSimulationBehavioralStress(totalSwitches = 2, passed = true))
        assertEquals(75, AuthoritativeMetricsEngine.calculateSimulationBehavioralStress(totalSwitches = 5, passed = false))
        assertEquals(35, AuthoritativeMetricsEngine.calculateSimulationBehavioralStress(totalSwitches = 0, passed = true))
    }

    @Test
    fun crossPlatformProfileAndEntitlements_syncBidirectionallyBetweenWebAndAndroid() = runBlocking {
        // Simulate a Web Platform JSON payload where the student unlocked CEH on the Web Platform
        // and updated their diagnostic score to 88% (Confident Master)
        val webPayloadJson = """
            {
              "userId": "usr_gnmohareb_cissp_001",
              "email": "gnmohareb@gmail.com",
              "displayName": "GN Mohareb",
              "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
              "subscriptionTier": "Universal Multi-Pass",
              "assessmentCompleted": true,
              "assessmentScorePercent": 88,
              "cognitiveStressBaseline": 35,
              "behavioralArchetype": "Confident Master",
              "hesitationNotes": "Calibrated on Web Platform",
              "averageDwellTimeSec": 34,
              "distractorEliminationRate": 0.75,
              "optionSwitchCountAvg": 0.9,
              "lastSyncTimestampMillis": ${System.currentTimeMillis() + 50000L},
              "deviceSyncedCount": 2,
              "currentJourneyStage": 4,
              "completedSimulationsCount": 6,
              "highestSimulationScore": 86,
              "examTargetDate": "Nov 24, 2026",
              "subscriptions": {
                "cissp": {
                  "examId": "cissp",
                  "examTitle": "Certified Information Systems Security Professional",
                  "shortCode": "CISSP",
                  "vendor": "(ISC)²",
                  "status": "ACTIVE",
                  "subscribedPlatform": "WEB",
                  "validUntilDate": "Dec 31, 2027",
                  "priceFormatted": "${'$'}29.00",
                  "universalAccess": true,
                  "activeSessionsCount": 15
                },
                "ceh": {
                  "examId": "ceh",
                  "examTitle": "Certified Ethical Hacker v12",
                  "shortCode": "CEH v12",
                  "vendor": "EC-Council",
                  "status": "ACTIVE",
                  "subscribedPlatform": "WEB",
                  "validUntilDate": "Dec 31, 2027",
                  "priceFormatted": "${'$'}29.00",
                  "universalAccess": true,
                  "activeSessionsCount": 3
                }
              }
            }
        """.trimIndent()

        val resolution = repository.ingestWebProfileJson(webPayloadJson)
        val androidProfile = repository.userProfile.value

        assertEquals(88, androidProfile.assessmentScorePercent)
        assertEquals(35, androidProfile.cognitiveStressBaseline)
        assertEquals("Confident Master", androidProfile.behavioralArchetype)
        assertEquals(86, androidProfile.highestSimulationScore)

        // Verify CEH is now unlocked on Android AND existing Android entitlements (like AWS-SAA / Sec+) were preserved!
        assertTrue(repository.authManager.isAuthorizedForExam("ceh", androidProfile))
        assertTrue(repository.authManager.isAuthorizedForExam("aws-saa", androidProfile))
        assertTrue(repository.authManager.isAuthorizedForExam("aws_csa", androidProfile))
        assertTrue(repository.authManager.isAuthorizedForExam("sec-plus", androidProfile))
        assertTrue(repository.authManager.isAuthorizedForExam("sec_plus", androidProfile))
        assertTrue(resolution.hadConflict)

        // Export back to Web JSON and verify schema compatibility with Web Platform
        val exportedWebJson = repository.exportWebProfileJson()
        val parsedExport = JSONObject(exportedWebJson)
        assertEquals("usr_gnmohareb_cissp_001", parsedExport.getString("userId"))
        assertEquals(88, parsedExport.getInt("assessmentScorePercent"))
        val subsObj = parsedExport.getJSONObject("subscriptions")
        assertEquals("ACTIVE", subsObj.getJSONObject("ceh").getString("status"))
        assertEquals("ACTIVE", subsObj.getJSONObject("aws-saa").getString("status"))
        assertEquals("ACTIVE", subsObj.getJSONObject("sec-plus").getString("status"))
    }

    @Test
    fun crossPlatformSimulationAttempt_ingestsFromWebAndUpdatesReadinessAndStudyPlan() = runBlocking {
        delay(150) // allow initial Room seed

        val webSimulationJson = """
            {
              "sessionId": "sess_web_9901",
              "examId": "cissp",
              "examTitle": "Certified Information Systems Security Professional",
              "timestamp": ${System.currentTimeMillis()},
              "totalQuestions": 50,
              "correctCount": 44,
              "scorePercent": 88,
              "passed": true,
              "timeSpentSeconds": 2100,
              "domainScores": {
                "d1": { "total": 10, "correct": 9, "percent": 90, "domainName": "Security & Risk Management" },
                "d3": { "total": 10, "correct": 8, "percent": 80, "domainName": "Security Architecture" }
              },
              "behavioralStressScore": 40,
              "eliminatedDistractorsCount": 9,
              "averageLatencySeconds": 42
            }
        """.trimIndent()

        val entity = repository.ingestWebSimulationResultJson(webSimulationJson)
        assertEquals("sess_web_9901", entity.id)
        assertEquals(88, entity.overallScorePercent)
        assertTrue(entity.isPassed)

        // Verify stored in Room SQLite and reflected in highestSimulationScore & 5-Stage Study Plan
        val fromDb = database.simulationScoreDao().getScoreById("sess_web_9901")
        assertNotNull(fromDb)
        assertEquals(88, fromDb?.overallScorePercent)
        assertEquals(88, repository.userProfile.value.highestSimulationScore)

        val readiness = repository.readinessReport.value
        assertTrue(readiness.readinessPercent >= 70)
        assertEquals(5, repository.studyPlanMilestones.value.size)
    }

    @Test
    fun offlineModeQueuesMutationsAndFlushesOnReconnectWithConflictResolution() = runBlocking {
        delay(150)

        // 1. Go offline on Android
        repository.setOnlineMode(false)
        assertFalse(repository.backendConfig.value.isOnline)

        // 2. Student unlocks CEH, updates a flashcard to Box 4 (KNOWN), and records a simulation attempt while offline
        repository.subscribeToSubject("ceh")
        val firstCardId = repository.flashcards.value.first().id
        repository.updateFlashcardBox(firstCardId, 4)

        val offlineSession = ExamSession(
            sessionId = "android_offline_sess_01",
            examId = "cissp",
            mode = ExamMode.FULL_SIMULATION,
            startTimeMillis = System.currentTimeMillis() - 1800_000L,
            durationSeconds = 1800,
            totalQuestions = 10,
            userAnswers = mapOf(0 to 0, 1 to 1),
            flaggedIndices = emptySet(),
            completedTimeMillis = System.currentTimeMillis(),
            scorePercent = 85,
            isPassed = true,
            domainScores = listOf(DomainScore("d1", "Security & Risk Management", 8, 10, 80))
        )
        repository.recordSession(offlineSession, optionSwitchCount = 1)
        delay(150)

        // Verify operations were queued in Room pending_sync_queue
        val pendingCountOffline = database.userProfileDao().getPendingSyncCount()
        assertTrue("Expected offline mutations to be queued in Room", pendingCountOffline >= 3)

        // Verify Flashcard status was updated to KNOWN (matching Web schema)
        val updatedCard = repository.flashcards.value.first { it.id == firstCardId }
        assertEquals(4, updatedCard.boxLevel)
        assertEquals(FlashcardStatus.KNOWN, updatedCard.status)

        // 3. Reconnect to network and flush queue
        repository.setOnlineMode(true)
        val syncSuccess = repository.syncCentralProfileWithCloud()
        assertTrue(syncSuccess)

        val pendingCountAfterSync = database.userProfileDao().getPendingSyncCount()
        assertEquals("Expected offline queue to be flushed upon reconnect", 0, pendingCountAfterSync)
    }

    @Test
    fun flashcardConflictResolution_prefersMostRecentReviewAndHigherBoxOnTie() {
        val localCard = FlashcardEntity(
            id = "fc_01",
            examId = "cissp",
            domainId = "d1",
            domainName = "Security & Risk Management",
            frontPrompt = "CIA Triad",
            backAnswer = "Confidentiality, Integrity, Availability",
            keyFormulaOrRule = "CIA",
            sourceCitation = "NIST",
            boxLevel = 2,
            status = "NEEDS_REVIEW",
            lastReviewedEpoch = 1000L
        )
        val remoteNewerCard = localCard.copy(
            boxLevel = 4,
            status = "KNOWN",
            lastReviewedEpoch = 2000L
        )

        val resolved = AuthoritativeMetricsEngine.resolveFlashcardConflict(localCard, remoteNewerCard)
        assertEquals(4, resolved.boxLevel)
        assertEquals("KNOWN", resolved.status)

        // Tie-breaker test: same timestamp, higher boxLevel wins
        val tieA = localCard.copy(boxLevel = 3, status = "KNOWN", lastReviewedEpoch = 5000L)
        val tieB = localCard.copy(boxLevel = 1, status = "UNREVIEWED", lastReviewedEpoch = 5000L)
        val tieResolved = AuthoritativeMetricsEngine.resolveFlashcardConflict(tieA, tieB)
        assertEquals(3, tieResolved.boxLevel)
    }

    @Test
    fun examCatalog_normalizesCrossPlatformExamIdsConsistently() {
        assertEquals("aws-saa", ExamCatalog.normalizeExamId("aws_csa"))
        assertEquals("aws-saa", ExamCatalog.normalizeExamId("aws-saa"))
        assertEquals("sec-plus", ExamCatalog.normalizeExamId("sec_plus"))
        assertEquals("sec-plus", ExamCatalog.normalizeExamId("sec-plus"))
        assertTrue(ExamCatalog.matchesExamId("aws_csa", "aws-saa"))
        assertTrue(ExamCatalog.matchesExamId("sec_plus", "sec-plus"))
        assertEquals("AWS SAA-C03", ExamCatalog.getExamById("aws_csa").shortCode)
        assertEquals("SY0-701", ExamCatalog.getExamById("sec_plus").shortCode)
    }
}
