package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(
    entities = [
        StudySourceEntity::class,
        FlashcardEntity::class,
        SimulationScoreEntity::class,
        UserProfileEntity::class,
        StudyPlanEntity::class,
        SyncQueueEntity::class
    ],
    version = 3,
    exportSchema = false
)
@TypeConverters(RoomConverters::class)
abstract class CertDatabase : RoomDatabase() {

    abstract fun studySourceDao(): StudySourceDao
    abstract fun flashcardDao(): FlashcardDao
    abstract fun simulationScoreDao(): SimulationScoreDao
    abstract fun userProfileDao(): UserProfileDao

    companion object {
        @Volatile
        private var INSTANCE: CertDatabase? = null

        fun getInstance(context: Context): CertDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    CertDatabase::class.java,
                    "certmaster_cache.db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
