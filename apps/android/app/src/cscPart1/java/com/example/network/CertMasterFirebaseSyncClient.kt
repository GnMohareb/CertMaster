package com.example.network

import android.content.Context
import com.example.data.local.FlashcardEntity
import com.example.data.local.SimulationScoreEntity
import com.example.data.local.StudySourceEntity
import com.example.data.local.SyncQueueEntity
import com.example.model.ExamReadinessReport
import com.example.model.JourneyMilestone
import com.example.model.UserCentralProfile

/**
 * Offline-only stub for standalone CSC Part 1 builds.
 * Contains zero Firebase, Firestore, Retrofit, OkHttp, or Moshi dependencies.
 */
class CertMasterFirebaseSyncClient(private val context: Context? = null) {

    companion object {
        const val FIREBASE_PROJECT_ID = ""
        const val FIRESTORE_DATABASE_ID = ""
        const val CANONICAL_SCHEMA_VERSION = 2
    }

    var customDeliveryHandler: (suspend (SyncQueueEntity) -> Boolean)? = null

    fun isFirestoreAvailable(): Boolean = false

    suspend fun deliverQueuedOperation(userId: String, op: SyncQueueEntity): Result<Boolean> {
        return Result.failure(IllegalStateException("Cloud sync is unavailable in standalone offline CSC Part 1."))
    }

    fun toWebProfileJson(profile: UserCentralProfile): String = "{}"

    fun fromWebProfileJson(jsonString: String): UserCentralProfile {
        return UserCentralProfile(targetExamId = "csc-part-1")
    }

    fun fromWebSimulationResultJson(jsonString: String, attemptNumber: Int = 1): SimulationScoreEntity {
        return SimulationScoreEntity.createHistoricalAttempt(
            id = "offline_unsupported",
            examId = "csc-part-1",
            timestampMillis = System.currentTimeMillis(),
            overallScore = 0,
            isPassed = false,
            timeSpentSeconds = 0,
            totalQuestions = 0,
            attemptNumber = attemptNumber,
            domainScores = emptyList()
        )
    }

    fun toWebSimulationResultJson(entity: SimulationScoreEntity, examTitle: String): String = "{}"

    suspend fun syncAllWithFirestore(
        userId: String,
        profile: UserCentralProfile,
        readiness: ExamReadinessReport,
        milestones: List<JourneyMilestone>,
        scores: List<SimulationScoreEntity>,
        flashcards: List<FlashcardEntity>,
        sources: List<StudySourceEntity>
    ): Result<UserCentralProfile> {
        return Result.failure(IllegalStateException("Firestore sync is disabled in standalone offline CSC Part 1."))
    }
}
