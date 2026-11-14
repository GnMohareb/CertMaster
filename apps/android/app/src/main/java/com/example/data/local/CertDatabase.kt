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
        ActiveExamAttemptEntity::class
    ],
    version = 4,
    exportSchema = false
)
@TypeConverters(RoomConverters::class)
abstract class CertDatabase : RoomDatabase() {

    abstract fun studySourceDao(): StudySourceDao
    abstract fun flashcardDao(): FlashcardDao
    abstract fun simulationScoreDao(): SimulationScoreDao
    abstract fun userProfileDao(): UserProfileDao
    abstract fun activeExamAttemptDao(): ActiveExamAttemptDao

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

        fun getInstance(context: Context): CertDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    CertDatabase::class.java,
                    "certmaster_cache.db"
                )
                    .addMigrations(MIGRATION_3_4)
                    .fallbackToDestructiveMigrationFrom(1, 2)
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
