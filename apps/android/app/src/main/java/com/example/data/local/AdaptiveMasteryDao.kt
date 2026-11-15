package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface AdaptiveMasteryDao {

    @Query("SELECT * FROM answer_events WHERE examId = :examId ORDER BY answeredAtMillis ASC")
    fun observeAnswerEvents(examId: String): Flow<List<AnswerEventEntity>>

    @Query("SELECT * FROM answer_events WHERE eventId = :eventId LIMIT 1")
    suspend fun getAnswerEventById(eventId: String): AnswerEventEntity?

    @Query("SELECT COUNT(*) FROM answer_events WHERE examId = :examId")
    suspend fun getAnswerEventCount(examId: String): Int

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAnswerEventIfNew(event: AnswerEventEntity): Long

    @Query("SELECT * FROM topic_mastery WHERE examId = :examId ORDER BY masteryPercent ASC, topicName ASC")
    fun observeTopicMastery(examId: String): Flow<List<TopicMasteryEntity>>

    @Query("SELECT * FROM topic_mastery WHERE examId = :examId ORDER BY masteryPercent ASC, topicName ASC")
    suspend fun getTopicMasteryList(examId: String): List<TopicMasteryEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertTopicMastery(entity: TopicMasteryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertTopicMasteryList(entities: List<TopicMasteryEntity>)

    @Query("SELECT * FROM question_exposure WHERE examId = :examId")
    fun observeQuestionExposures(examId: String): Flow<List<QuestionExposureEntity>>

    @Query("SELECT * FROM question_exposure WHERE examId = :examId")
    suspend fun getQuestionExposures(examId: String): List<QuestionExposureEntity>

    @Query("SELECT * FROM question_exposure WHERE compositeKey = :compositeKey LIMIT 1")
    suspend fun getQuestionExposure(compositeKey: String): QuestionExposureEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertQuestionExposure(entity: QuestionExposureEntity)

    @Query("SELECT COALESCE(MAX(lastGlobalOrder), 0) FROM question_exposure WHERE examId = :examId")
    suspend fun getMaxGlobalOrder(examId: String): Long

    @Query("DELETE FROM answer_events WHERE examId = :examId")
    suspend fun deleteAnswerEventsByExam(examId: String)

    @Query("DELETE FROM topic_mastery WHERE examId = :examId")
    suspend fun deleteTopicMasteryByExam(examId: String)

    @Query("DELETE FROM question_exposure WHERE examId = :examId")
    suspend fun deleteQuestionExposuresByExam(examId: String)
}
