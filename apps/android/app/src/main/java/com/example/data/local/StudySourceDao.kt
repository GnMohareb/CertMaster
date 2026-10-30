package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface StudySourceDao {

    @Query("SELECT * FROM study_sources WHERE examId = :examId ORDER BY title ASC")
    fun getSourcesByExam(examId: String): Flow<List<StudySourceEntity>>

    @Query("SELECT * FROM study_sources ORDER BY title ASC")
    fun getAllSources(): Flow<List<StudySourceEntity>>

    @Query("SELECT * FROM study_sources WHERE id = :id LIMIT 1")
    suspend fun getSourceById(id: String): StudySourceEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSources(sources: List<StudySourceEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSource(source: StudySourceEntity)

    @Query("DELETE FROM study_sources WHERE id = :id")
    suspend fun deleteSource(id: String)

    @Query("SELECT COUNT(*) FROM study_sources WHERE examId = :examId")
    suspend fun getSourceCount(examId: String): Int
}
