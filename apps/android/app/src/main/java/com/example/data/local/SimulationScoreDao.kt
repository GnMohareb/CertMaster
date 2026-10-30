package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface SimulationScoreDao {

    @Query("SELECT * FROM simulation_scores WHERE examId = :examId ORDER BY timestampMillis ASC")
    fun getScoresByExam(examId: String): Flow<List<SimulationScoreEntity>>

    @Query("SELECT * FROM simulation_scores ORDER BY timestampMillis ASC")
    fun getAllScores(): Flow<List<SimulationScoreEntity>>

    @Query("SELECT * FROM simulation_scores WHERE id = :id LIMIT 1")
    suspend fun getScoreById(id: String): SimulationScoreEntity?

    @Query("SELECT COUNT(*) FROM simulation_scores WHERE examId = :examId")
    suspend fun getScoreCount(examId: String): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertScore(score: SimulationScoreEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertScores(scores: List<SimulationScoreEntity>)

    @Query("DELETE FROM simulation_scores WHERE examId = :examId")
    suspend fun deleteScoresByExam(examId: String)
}
