package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface UserProfileDao {

    @Query("SELECT * FROM cached_user_profiles WHERE userId = :userId LIMIT 1")
    suspend fun getProfileById(userId: String): UserProfileEntity?

    @Query("SELECT * FROM cached_user_profiles LIMIT 1")
    fun observeActiveProfile(): Flow<UserProfileEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProfile(profile: UserProfileEntity)

    @Query("SELECT * FROM cached_study_plans WHERE examId = :examId LIMIT 1")
    suspend fun getStudyPlanByExam(examId: String): StudyPlanEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudyPlan(plan: StudyPlanEntity)

    @Query("SELECT * FROM pending_sync_queue ORDER BY createdAtMillis ASC")
    suspend fun getPendingSyncOperations(): List<SyncQueueEntity>

    @Query("SELECT COUNT(*) FROM pending_sync_queue")
    suspend fun getPendingSyncCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun enqueueSyncOperation(op: SyncQueueEntity)

    @Query("DELETE FROM pending_sync_queue WHERE operationId = :operationId")
    suspend fun removeSyncOperation(operationId: String)

    @Query("UPDATE pending_sync_queue SET retryCount = :retryCount, lastError = :lastError WHERE operationId = :operationId")
    suspend fun updateSyncOperationRetry(operationId: String, retryCount: Int, lastError: String?)
}
