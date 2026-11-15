package com.example

import android.content.Context
import androidx.room.Room
import androidx.sqlite.db.SupportSQLiteDatabase
import androidx.sqlite.db.SupportSQLiteOpenHelper
import androidx.sqlite.db.framework.FrameworkSQLiteOpenHelperFactory
import androidx.test.core.app.ApplicationProvider
import com.example.data.local.AnswerEventEntity
import com.example.data.local.CertDatabase
import com.example.data.local.QuestionExposureEntity
import com.example.data.local.TopicMasteryEntity
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class Migration4To5Test {

    private lateinit var context: Context
    private val testDbName = "migration_4_to_5_test.db"

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        context.deleteDatabase(testDbName)
    }

    @After
    fun tearDown() {
        context.deleteDatabase(testDbName)
    }

    @Test
    fun migrate4To5_preservesExistingData_validatesRoomSchema_andSupportsNewTables() = runBlocking {
        // 1. Create an v4 SQLite fixture matching the released v4 entity declarations at c6cc472 and populate it with pre-migration rows
        val config = SupportSQLiteOpenHelper.Configuration.builder(context)
            .name(testDbName)
            .callback(object : SupportSQLiteOpenHelper.Callback(4) {
                override fun onCreate(db: SupportSQLiteDatabase) {
                    db.execSQL("""CREATE TABLE IF NOT EXISTS `study_sources` (`id` TEXT NOT NULL, `examId` TEXT NOT NULL, `domainId` TEXT NOT NULL, `domainName` TEXT NOT NULL, `title` TEXT NOT NULL, `authorOrStandard` TEXT NOT NULL, `type` TEXT NOT NULL, `summary` TEXT NOT NULL, `keyTakeaways` TEXT NOT NULL, `fullContent` TEXT NOT NULL, `cachedAtMillis` INTEGER NOT NULL, PRIMARY KEY(`id`))""")
                    db.execSQL("""CREATE TABLE IF NOT EXISTS `cached_flashcards` (`id` TEXT NOT NULL, `examId` TEXT NOT NULL, `domainId` TEXT NOT NULL, `domainName` TEXT NOT NULL, `frontPrompt` TEXT NOT NULL, `backAnswer` TEXT NOT NULL, `keyFormulaOrRule` TEXT NOT NULL, `sourceCitation` TEXT NOT NULL, `sourceDocId` TEXT, `boxLevel` INTEGER NOT NULL, `status` TEXT NOT NULL, `lastReviewedEpoch` INTEGER NOT NULL, PRIMARY KEY(`id`))""")
                    db.execSQL("""CREATE TABLE IF NOT EXISTS `cached_user_profiles` (`userId` TEXT NOT NULL, `email` TEXT NOT NULL, `displayName` TEXT NOT NULL, `avatarUrl` TEXT NOT NULL, `subscriptionTier` TEXT NOT NULL, `centralPortalUrl` TEXT NOT NULL, `assessmentCompleted` INTEGER NOT NULL, `assessmentScorePercent` INTEGER NOT NULL, `cognitiveStressBaseline` INTEGER NOT NULL, `behavioralArchetype` TEXT NOT NULL, `hesitationNotes` TEXT NOT NULL, `averageDwellTimeSec` INTEGER NOT NULL, `distractorEliminationRate` REAL NOT NULL, `optionSwitchCountAvg` REAL NOT NULL, `deviceSyncedCount` INTEGER NOT NULL, `currentJourneyStage` INTEGER NOT NULL, `completedSimulationsCount` INTEGER NOT NULL, `highestSimulationScore` INTEGER NOT NULL, `examTargetDate` TEXT NOT NULL, `subscriptionsJson` TEXT NOT NULL, `lastSyncTimestampMillis` INTEGER NOT NULL, PRIMARY KEY(`userId`))""")
                    db.execSQL("""CREATE TABLE IF NOT EXISTS `cached_study_plans` (`examId` TEXT NOT NULL, `userId` TEXT NOT NULL, `currentStage` INTEGER NOT NULL, `readinessPercent` INTEGER NOT NULL, `passProbabilityPercent` INTEGER NOT NULL, `passGuaranteeQualified` INTEGER NOT NULL, `weakestDomainId` TEXT NOT NULL, `weakestDomainName` TEXT NOT NULL, `weakestDomainScore` INTEGER NOT NULL, `targetDate` TEXT NOT NULL, `milestonesJson` TEXT NOT NULL, `updatedAtMillis` INTEGER NOT NULL, PRIMARY KEY(`examId`))""")
                    db.execSQL("""CREATE TABLE IF NOT EXISTS `pending_sync_queue` (`operationId` TEXT NOT NULL, `domainType` TEXT NOT NULL, `entityId` TEXT NOT NULL, `payloadJson` TEXT NOT NULL, `createdAtMillis` INTEGER NOT NULL, `retryCount` INTEGER NOT NULL, `lastError` TEXT, PRIMARY KEY(`operationId`))""")
                    db.execSQL("""CREATE TABLE IF NOT EXISTS `simulation_scores` (`id` TEXT NOT NULL, `examId` TEXT NOT NULL, `timestampMillis` INTEGER NOT NULL, `overallScorePercent` INTEGER NOT NULL, `isPassed` INTEGER NOT NULL, `timeSpentSeconds` INTEGER NOT NULL, `totalQuestions` INTEGER NOT NULL, `attemptNumber` INTEGER NOT NULL, `domainScoresJson` TEXT NOT NULL, `mode` TEXT NOT NULL, `startTimeMillis` INTEGER NOT NULL, `questionIdsJson` TEXT NOT NULL, `userAnswersJson` TEXT NOT NULL, `flaggedIndicesJson` TEXT NOT NULL, `struckOptionsJson` TEXT NOT NULL, `optionSwitchCount` INTEGER NOT NULL, PRIMARY KEY(`id`))""")
                    db.execSQL("""CREATE TABLE IF NOT EXISTS `active_exam_attempt` (`examId` TEXT NOT NULL, `mode` TEXT NOT NULL, `questionIdsJson` TEXT NOT NULL, `currentIndex` INTEGER NOT NULL, `userAnswersJson` TEXT NOT NULL, `flaggedIndicesJson` TEXT NOT NULL, `struckOptionsJson` TEXT NOT NULL, `optionSwitchCountsJson` TEXT NOT NULL, `remainingSeconds` INTEGER NOT NULL, `isPaused` INTEGER NOT NULL, `startedAtMillis` INTEGER NOT NULL, `updatedAtMillis` INTEGER NOT NULL, PRIMARY KEY(`examId`))""")
                }

                override fun onUpgrade(db: SupportSQLiteDatabase, oldVersion: Int, newVersion: Int) = Unit
            })
            .build()

        val helper = FrameworkSQLiteOpenHelperFactory().create(config)
        val v4Db = helper.writableDatabase
        v4Db.execSQL(
            """
            INSERT INTO `simulation_scores` VALUES (
                'score_v4_1', 'csc-part-1', 1700000000000, 68, 1, 900, 20, 1,
                '[{"domainId":"csc-d1","domainName":"Capital Markets","scorePercent":68,"correctCount":14,"totalCount":20}]',
                'FULL_SIMULATION', 1699999100000, '["q1","q2"]', '{"0":1}', '[0]', '{}', 2
            )
            """.trimIndent()
        )
        v4Db.execSQL(
            """
            INSERT INTO `active_exam_attempt` VALUES (
                'csc-part-1', 'DOMAIN_PRACTICE', '["q1","q2"]', 1, '{"0":0}', '[]', '{}', '{}', 120, 1, 1700000100000, 1700000200000
            )
            """.trimIndent()
        )
        v4Db.execSQL(
            """
            INSERT INTO `cached_flashcards` VALUES (
                'fc_v4_1', 'csc-part-1', 'csc-d1', 'Capital Markets', 'Prompt', 'Answer', 'Rule', 'Ref', '', 3, 'LEARNING', 1700000000000
            )
            """.trimIndent()
        )
        v4Db.close()
        helper.close()

        // 2. Open with Room v5 + MIGRATION_4_5 (Room automatically validates TableInfo for ALL 10 entities)
        val roomDb = Room.databaseBuilder(context, CertDatabase::class.java, testDbName)
            .addMigrations(CertDatabase.MIGRATION_3_4, CertDatabase.MIGRATION_4_5)
            .allowMainThreadQueries()
            .build()

        try {
            val migratedScores = roomDb.simulationScoreDao().getScoresByExam("csc-part-1").first()
            assertEquals(1, migratedScores.size)
            val s = migratedScores.first()
            assertEquals("score_v4_1", s.id)
            assertEquals(68, s.overallScorePercent)
            assertEquals("offline-mastery-v1", s.modelVersion)
            assertEquals("1", s.bankVersion)

            val migratedAttempt = roomDb.activeExamAttemptDao().getAttemptForExam("csc-part-1")
            assertNotNull(migratedAttempt)
            assertEquals(1, migratedAttempt!!.currentIndex)
            assertEquals("[]", migratedAttempt.checkedIndicesJson)
            assertEquals("[]", migratedAttempt.remediationQueueJson)
            assertEquals(0, migratedAttempt.globalStepCounter)

            val migratedCards = roomDb.flashcardDao().getFlashcardsByExam("csc-part-1").first()
            assertEquals(1, migratedCards.size)
            assertEquals(3, migratedCards.first().boxLevel)

            // 3. Verify newly created v5 tables accept writes and idempotent inserts
            val event = AnswerEventEntity(
                eventId = "csc-part-1::att1::q1",
                examId = "csc-part-1",
                attemptId = "att1",
                questionId = "q1",
                domainId = "csc-d1",
                topicKey = "t_reg",
                topicName = "Regulation",
                selectedIndex = 0,
                isCorrect = true,
                wasSkipped = false,
                viewedExplanationOnly = false,
                attemptMode = "AI_ADAPTIVE_DRILL",
                difficulty = "MEDIUM",
                answeredAtMillis = 1700000300000L,
                appliedToMastery = true
            )
            val firstInsert = roomDb.adaptiveMasteryDao().insertAnswerEventIfNew(event)
            val dupInsert = roomDb.adaptiveMasteryDao().insertAnswerEventIfNew(event)
            assertTrue(firstInsert > 0L)
            assertEquals(-1L, dupInsert)

            roomDb.adaptiveMasteryDao().upsertTopicMastery(
                TopicMasteryEntity(
                    compositeKey = "csc-part-1::t_reg",
                    examId = "csc-part-1",
                    topicKey = "t_reg",
                    topicName = "Regulation",
                    domainId = "csc-d1",
                    domainName = "Capital Markets",
                    masteryPercent = 64,
                    accuracyPercent = 100,
                    attemptCount = 1,
                    correctCount = 1,
                    uniqueQuestionIdsJson = "[\"q1\"]",
                    baselineScorePercent = null,
                    baselineAttemptCount = 0,
                    confidence = "INSUFFICIENT_EVIDENCE",
                    lastDifficulty = "MEDIUM",
                    consecutiveCorrect = 1,
                    consecutiveIncorrect = 0,
                    lastReviewedAtMillis = 1700000300000L,
                    nextReviewDueAtMillis = 1700086700000L,
                    modelVersion = "offline-mastery-v1",
                    bankVersion = "1",
                    hasExplicitTopicMapping = true,
                    updatedAtMillis = 1700000300000L
                )
            )
            roomDb.adaptiveMasteryDao().upsertQuestionExposure(
                QuestionExposureEntity(
                    compositeKey = "csc-part-1::q1",
                    examId = "csc-part-1",
                    questionId = "q1",
                    exposureCount = 1,
                    correctCount = 1,
                    incorrectCount = 0,
                    lastCorrect = true,
                    lastGlobalOrder = 1L,
                    dueReviewAfterOrder = 0L,
                    lastAnsweredAtMillis = 1700000300000L,
                    nextReviewDueAtMillis = 1700086700000L
                )
            )

            assertEquals(1, roomDb.adaptiveMasteryDao().getTopicMasteryList("csc-part-1").size)
            assertEquals(1, roomDb.adaptiveMasteryDao().getQuestionExposures("csc-part-1").size)
        } finally {
            roomDb.close()
        }
    }
}
