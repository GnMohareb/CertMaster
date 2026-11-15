package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

@Database(
    entities = [
        StudySourceEntity::class,
        FlashcardEntity::class,
        SimulationScoreEntity::class,
        UserProfileEntity::class,
        StudyPlanEntity::class,
        SyncQueueEntity::class,
        ActiveExamAttemptEntity::class,
        AnswerEventEntity::class,
        TopicMasteryEntity::class,
        QuestionExposureEntity::class
    ],
    version = 5,
    exportSchema = false
)
@TypeConverters(RoomConverters::class)
abstract class CertDatabase : RoomDatabase() {

    abstract fun studySourceDao(): StudySourceDao
    abstract fun flashcardDao(): FlashcardDao
    abstract fun simulationScoreDao(): SimulationScoreDao
    abstract fun userProfileDao(): UserProfileDao
    abstract fun activeExamAttemptDao(): ActiveExamAttemptDao
    abstract fun adaptiveMasteryDao(): AdaptiveMasteryDao

    companion object {
        @Volatile
        private var INSTANCE: CertDatabase? = null

        val MIGRATION_3_4 = object : Migration(3, 4) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS `active_exam_attempt` (
                        `examId` TEXT NOT NULL,
                        `mode` TEXT NOT NULL,
                        `questionIdsJson` TEXT NOT NULL,
                        `currentIndex` INTEGER NOT NULL,
                        `userAnswersJson` TEXT NOT NULL,
                        `flaggedIndicesJson` TEXT NOT NULL,
                        `struckOptionsJson` TEXT NOT NULL,
                        `optionSwitchCountsJson` TEXT NOT NULL,
                        `remainingSeconds` INTEGER NOT NULL,
                        `isPaused` INTEGER NOT NULL,
                        `startedAtMillis` INTEGER NOT NULL,
                        `updatedAtMillis` INTEGER NOT NULL,
                        PRIMARY KEY(`examId`)
                    )
                    """.trimIndent()
                )
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `mode` TEXT NOT NULL DEFAULT 'FULL_SIMULATION'")
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `startTimeMillis` INTEGER NOT NULL DEFAULT 0")
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `questionIdsJson` TEXT NOT NULL DEFAULT '[]'")
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `userAnswersJson` TEXT NOT NULL DEFAULT '{}'")
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `flaggedIndicesJson` TEXT NOT NULL DEFAULT '[]'")
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `struckOptionsJson` TEXT NOT NULL DEFAULT '{}'")
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `optionSwitchCount` INTEGER NOT NULL DEFAULT 0")
            }
        }

        val MIGRATION_4_5 = object : Migration(4, 5) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS `answer_events` (
                        `eventId` TEXT NOT NULL,
                        `examId` TEXT NOT NULL,
                        `attemptId` TEXT NOT NULL,
                        `questionId` TEXT NOT NULL,
                        `domainId` TEXT NOT NULL,
                        `topicKey` TEXT NOT NULL,
                        `topicName` TEXT NOT NULL,
                        `selectedIndex` INTEGER NOT NULL,
                        `isCorrect` INTEGER NOT NULL,
                        `wasSkipped` INTEGER NOT NULL,
                        `viewedExplanationOnly` INTEGER NOT NULL,
                        `attemptMode` TEXT NOT NULL,
                        `difficulty` TEXT NOT NULL,
                        `answeredAtMillis` INTEGER NOT NULL,
                        `appliedToMastery` INTEGER NOT NULL,
                        PRIMARY KEY(`eventId`)
                    )
                    """.trimIndent()
                )
                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS `topic_mastery` (
                        `compositeKey` TEXT NOT NULL,
                        `examId` TEXT NOT NULL,
                        `topicKey` TEXT NOT NULL,
                        `topicName` TEXT NOT NULL,
                        `domainId` TEXT NOT NULL,
                        `domainName` TEXT NOT NULL,
                        `masteryPercent` INTEGER NOT NULL,
                        `accuracyPercent` INTEGER NOT NULL,
                        `attemptCount` INTEGER NOT NULL,
                        `correctCount` INTEGER NOT NULL,
                        `uniqueQuestionIdsJson` TEXT NOT NULL,
                        `baselineScorePercent` INTEGER,
                        `baselineAttemptCount` INTEGER NOT NULL,
                        `confidence` TEXT NOT NULL,
                        `lastDifficulty` TEXT NOT NULL,
                        `consecutiveCorrect` INTEGER NOT NULL,
                        `consecutiveIncorrect` INTEGER NOT NULL,
                        `lastReviewedAtMillis` INTEGER NOT NULL,
                        `nextReviewDueAtMillis` INTEGER NOT NULL,
                        `modelVersion` TEXT NOT NULL,
                        `bankVersion` TEXT NOT NULL,
                        `hasExplicitTopicMapping` INTEGER NOT NULL,
                        `updatedAtMillis` INTEGER NOT NULL,
                        PRIMARY KEY(`compositeKey`)
                    )
                    """.trimIndent()
                )
                db.execSQL(
                    """
                    CREATE TABLE IF NOT EXISTS `question_exposure` (
                        `compositeKey` TEXT NOT NULL,
                        `examId` TEXT NOT NULL,
                        `questionId` TEXT NOT NULL,
                        `exposureCount` INTEGER NOT NULL,
                        `correctCount` INTEGER NOT NULL,
                        `incorrectCount` INTEGER NOT NULL,
                        `lastCorrect` INTEGER NOT NULL,
                        `lastGlobalOrder` INTEGER NOT NULL,
                        `dueReviewAfterOrder` INTEGER NOT NULL,
                        `lastAnsweredAtMillis` INTEGER NOT NULL,
                        `nextReviewDueAtMillis` INTEGER NOT NULL,
                        PRIMARY KEY(`compositeKey`)
                    )
                    """.trimIndent()
                )
                db.execSQL("ALTER TABLE `active_exam_attempt` ADD COLUMN `attemptId` TEXT NOT NULL DEFAULT ''")
                db.execSQL("ALTER TABLE `active_exam_attempt` ADD COLUMN `checkedIndicesJson` TEXT NOT NULL DEFAULT '[]'")
                db.execSQL("ALTER TABLE `active_exam_attempt` ADD COLUMN `remediationQueueJson` TEXT NOT NULL DEFAULT '[]'")
                db.execSQL("ALTER TABLE `active_exam_attempt` ADD COLUMN `selectionReasonsJson` TEXT NOT NULL DEFAULT '{}'")
                db.execSQL("ALTER TABLE `active_exam_attempt` ADD COLUMN `globalStepCounter` INTEGER NOT NULL DEFAULT 0")

                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `isInitialBaseline` INTEGER NOT NULL DEFAULT 0")
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `bankVersion` TEXT NOT NULL DEFAULT '1'")
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `modelVersion` TEXT NOT NULL DEFAULT 'offline-mastery-v1'")
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `topicScoresJson` TEXT NOT NULL DEFAULT '[]'")
                db.execSQL("ALTER TABLE `simulation_scores` ADD COLUMN `coverageSummary` TEXT NOT NULL DEFAULT ''")
            }
        }

        fun getInstance(context: Context): CertDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    CertDatabase::class.java,
                    "certmaster_cache.db"
                )
                    .addMigrations(MIGRATION_3_4, MIGRATION_4_5)
                    .fallbackToDestructiveMigrationFrom(1, 2)
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
