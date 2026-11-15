package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.model.AdaptiveConfig
import com.example.model.EvidenceConfidence
import com.example.model.QuestionDifficulty
import com.example.model.QuestionExposureState
import com.example.model.TopicMasteryState
import org.json.JSONArray

/**
 * Immutable answer event log keyed deterministically (e.g. "attemptId::questionId")
 * so resuming, reopening, or re-submitting an attempt never double-applies mastery evidence.
 */
@Entity(tableName = "answer_events")
data class AnswerEventEntity(
    @PrimaryKey val eventId: String,
    val examId: String,
    val attemptId: String,
    val questionId: String,
    val domainId: String,
    val topicKey: String,
    val topicName: String,
    val selectedIndex: Int,
    val isCorrect: Boolean,
    val wasSkipped: Boolean,
    val viewedExplanationOnly: Boolean,
    val attemptMode: String,
    val difficulty: String,
    val answeredAtMillis: Long,
    val appliedToMastery: Boolean
)

/**
 * Persisted per-topic mastery and baseline evidence in Room SQLite.
 */
@Entity(tableName = "topic_mastery")
data class TopicMasteryEntity(
    @PrimaryKey val compositeKey: String,
    val examId: String,
    val topicKey: String,
    val topicName: String,
    val domainId: String,
    val domainName: String,
    val masteryPercent: Int,
    val accuracyPercent: Int,
    val attemptCount: Int,
    val correctCount: Int,
    val uniqueQuestionIdsJson: String,
    val baselineScorePercent: Int?,
    val baselineAttemptCount: Int,
    val confidence: String,
    val lastDifficulty: String,
    val consecutiveCorrect: Int,
    val consecutiveIncorrect: Int,
    val lastReviewedAtMillis: Long,
    val nextReviewDueAtMillis: Long,
    val modelVersion: String,
    val bankVersion: String,
    val hasExplicitTopicMapping: Boolean,
    val updatedAtMillis: Long
) {
    fun toDomainModel(): TopicMasteryState {
        val uniqueIds = try {
            val arr = JSONArray(uniqueQuestionIdsJson)
            (0 until arr.length()).map { arr.getString(it) }.toSet()
        } catch (_: Exception) {
            emptySet()
        }
        val parsedConfidence = try {
            EvidenceConfidence.valueOf(confidence)
        } catch (_: Exception) {
            EvidenceConfidence.UNASSESSED
        }
        val parsedDifficulty = try {
            QuestionDifficulty.valueOf(lastDifficulty)
        } catch (_: Exception) {
            QuestionDifficulty.MEDIUM
        }
        return TopicMasteryState(
            examId = examId,
            topicKey = topicKey,
            topicName = topicName,
            domainId = domainId,
            domainName = domainName,
            masteryPercent = masteryPercent,
            accuracyPercent = accuracyPercent,
            attemptCount = attemptCount,
            correctCount = correctCount,
            uniqueQuestionIds = uniqueIds,
            baselineScorePercent = baselineScorePercent,
            baselineAttemptCount = baselineAttemptCount,
            confidence = parsedConfidence,
            lastDifficulty = parsedDifficulty,
            consecutiveCorrect = consecutiveCorrect,
            consecutiveIncorrect = consecutiveIncorrect,
            lastReviewedAtMillis = lastReviewedAtMillis,
            nextReviewDueAtMillis = nextReviewDueAtMillis,
            modelVersion = modelVersion,
            bankVersion = bankVersion,
            hasExplicitTopicMapping = hasExplicitTopicMapping
        )
    }

    companion object {
        fun keyFor(examId: String, topicKey: String): String = "$examId::$topicKey"

        fun fromDomainModel(state: TopicMasteryState, updatedAtMillis: Long = System.currentTimeMillis()): TopicMasteryEntity {
            val arr = JSONArray().apply { state.uniqueQuestionIds.sorted().forEach { put(it) } }
            return TopicMasteryEntity(
                compositeKey = keyFor(state.examId, state.topicKey),
                examId = state.examId,
                topicKey = state.topicKey,
                topicName = state.topicName,
                domainId = state.domainId,
                domainName = state.domainName,
                masteryPercent = state.masteryPercent,
                accuracyPercent = state.accuracyPercent,
                attemptCount = state.attemptCount,
                correctCount = state.correctCount,
                uniqueQuestionIdsJson = arr.toString(),
                baselineScorePercent = state.baselineScorePercent,
                baselineAttemptCount = state.baselineAttemptCount,
                confidence = state.confidence.name,
                lastDifficulty = state.lastDifficulty.name,
                consecutiveCorrect = state.consecutiveCorrect,
                consecutiveIncorrect = state.consecutiveIncorrect,
                lastReviewedAtMillis = state.lastReviewedAtMillis,
                nextReviewDueAtMillis = state.nextReviewDueAtMillis,
                modelVersion = state.modelVersion.ifBlank { AdaptiveConfig.DEFAULT_MODEL_VERSION },
                bankVersion = state.bankVersion.ifBlank { "1" },
                hasExplicitTopicMapping = state.hasExplicitTopicMapping,
                updatedAtMillis = updatedAtMillis
            )
        }
    }
}

/**
 * Tracks per-question exposure counts and delayed revisit scheduling in Room SQLite.
 */
@Entity(tableName = "question_exposure")
data class QuestionExposureEntity(
    @PrimaryKey val compositeKey: String,
    val examId: String,
    val questionId: String,
    val exposureCount: Int,
    val correctCount: Int,
    val incorrectCount: Int,
    val lastCorrect: Boolean,
    val lastGlobalOrder: Long,
    val dueReviewAfterOrder: Long,
    val lastAnsweredAtMillis: Long,
    val nextReviewDueAtMillis: Long
) {
    fun toDomainModel(): QuestionExposureState = QuestionExposureState(
        examId = examId,
        questionId = questionId,
        exposureCount = exposureCount,
        correctCount = correctCount,
        incorrectCount = incorrectCount,
        lastCorrect = lastCorrect,
        lastGlobalOrder = lastGlobalOrder,
        dueReviewAfterOrder = dueReviewAfterOrder,
        lastAnsweredAtMillis = lastAnsweredAtMillis,
        nextReviewDueAtMillis = nextReviewDueAtMillis
    )

    companion object {
        fun keyFor(examId: String, questionId: String): String = "$examId::$questionId"

        fun fromDomainModel(state: QuestionExposureState): QuestionExposureEntity = QuestionExposureEntity(
            compositeKey = keyFor(state.examId, state.questionId),
            examId = state.examId,
            questionId = state.questionId,
            exposureCount = state.exposureCount,
            correctCount = state.correctCount,
            incorrectCount = state.incorrectCount,
            lastCorrect = state.lastCorrect,
            lastGlobalOrder = state.lastGlobalOrder,
            dueReviewAfterOrder = state.dueReviewAfterOrder,
            lastAnsweredAtMillis = state.lastAnsweredAtMillis,
            nextReviewDueAtMillis = state.nextReviewDueAtMillis
        )
    }
}
