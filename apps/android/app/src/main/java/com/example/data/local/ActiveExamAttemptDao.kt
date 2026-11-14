package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface ActiveExamAttemptDao {
    @Query("SELECT * FROM active_exam_attempt WHERE examId = :examId LIMIT 1")
    suspend fun getAttemptForExam(examId: String): ActiveExamAttemptEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveAttempt(attempt: ActiveExamAttemptEntity)

    @Query("DELETE FROM active_exam_attempt WHERE examId = :examId")
    suspend fun deleteAttemptForExam(examId: String)
}
