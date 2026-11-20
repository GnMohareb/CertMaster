package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface FlashcardDao {

    @Query("SELECT * FROM cached_flashcards WHERE examId = :examId ORDER BY boxLevel ASC, id ASC")
    fun getFlashcardsByExam(examId: String): Flow<List<FlashcardEntity>>

    @Query("SELECT * FROM cached_flashcards ORDER BY boxLevel ASC, id ASC")
    fun getAllFlashcards(): Flow<List<FlashcardEntity>>

    @Query("SELECT * FROM cached_flashcards WHERE id = :id LIMIT 1")
    suspend fun getFlashcardById(id: String): FlashcardEntity?

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertMissingFlashcards(cards: List<FlashcardEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFlashcards(cards: List<FlashcardEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFlashcard(card: FlashcardEntity)

    @Query(
        "UPDATE cached_flashcards SET boxLevel = :newBoxLevel, " +
            "status = CASE WHEN :newBoxLevel >= 3 THEN 'KNOWN' WHEN :newBoxLevel = 2 THEN 'NEEDS_REVIEW' ELSE 'UNREVIEWED' END, " +
            "lastReviewedEpoch = :lastReviewed WHERE id = :id"
    )
    suspend fun updateBoxLevel(id: String, newBoxLevel: Int, lastReviewed: Long = System.currentTimeMillis())

    @Query("DELETE FROM cached_flashcards WHERE id = :id")
    suspend fun deleteFlashcard(id: String)

    @Query("SELECT COUNT(*) FROM cached_flashcards WHERE examId = :examId")
    suspend fun getFlashcardCount(examId: String): Int
}
