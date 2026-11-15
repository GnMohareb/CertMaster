package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.model.DomainScore
import com.example.model.EvidenceConfidence
import com.example.model.ExamSession
import com.example.model.TopicScoreRecord
import org.json.JSONArray
import org.json.JSONObject

@Entity(tableName = "simulation_scores")
data class SimulationScoreEntity(
    @PrimaryKey val id: String,
    val examId: String,
    val timestampMillis: Long,
    val overallScorePercent: Int,
    val isPassed: Boolean,
    val timeSpentSeconds: Int,
    val totalQuestions: Int,
    val attemptNumber: Int,
    val domainScoresJson: String,
    val mode: String = "FULL_SIMULATION",
    val startTimeMillis: Long = 0L,
    val questionIdsJson: String = "[]",
    val userAnswersJson: String = "{}",
    val flaggedIndicesJson: String = "[]",
    val struckOptionsJson: String = "{}",
    val optionSwitchCount: Int = 0,
    val isInitialBaseline: Boolean = false,
    val bankVersion: String = "1",
    val modelVersion: String = "offline-mastery-v1",
    val topicScoresJson: String = "[]",
    val coverageSummary: String = ""
) {
    /**
     * Parses the JSON domain score breakdown into a list of [DomainScoreRecord].
     */
    fun parseDomainScores(): List<DomainScoreRecord> {
        if (domainScoresJson.isBlank() || domainScoresJson == "[]") return emptyList()
        return try {
            val jsonArray = JSONArray(domainScoresJson)
            val list = mutableListOf<DomainScoreRecord>()
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                list.add(
                    DomainScoreRecord(
                        domainId = obj.optString("domainId", "d1"),
                        domainName = obj.optString("domainName", "General"),
                        scorePercent = obj.optInt("scorePercent", 0),
                        correctCount = obj.optInt("correctCount", 0),
                        totalCount = obj.optInt("totalCount", 0)
                    )
                )
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun parseTopicScores(): List<TopicScoreRecord> = Companion.parseTopicScoresJson(topicScoresJson)

    fun toExamSession(): ExamSession {
        val parsedMode = try {
            com.example.model.ExamMode.valueOf(mode)
        } catch (_: Exception) {
            com.example.model.ExamMode.FULL_SIMULATION
        }
        val effectiveStart = if (startTimeMillis > 0L) {
            startTimeMillis
        } else {
            (timestampMillis - (timeSpentSeconds * 1000L)).coerceAtLeast(0L)
        }
        return ExamSession(
            sessionId = id,
            examId = examId,
            mode = parsedMode,
            startTimeMillis = effectiveStart,
            durationSeconds = timeSpentSeconds,
            totalQuestions = totalQuestions,
            userAnswers = ActiveExamAttemptEntity.parseIntIntMap(userAnswersJson),
            flaggedIndices = ActiveExamAttemptEntity.parseIntSet(flaggedIndicesJson),
            struckOptions = ActiveExamAttemptEntity.parseIntSetMap(struckOptionsJson),
            completedTimeMillis = timestampMillis,
            scorePercent = overallScorePercent,
            isPassed = isPassed,
            domainScores = parseDomainScores().map { rec ->
                DomainScore(
                    domainId = rec.domainId,
                    domainName = rec.domainName,
                    correctCount = rec.correctCount,
                    totalCount = rec.totalCount,
                    percentage = rec.scorePercent
                )
            },
            questionIds = ActiveExamAttemptEntity.parseStringList(questionIdsJson),
            isInitialBaseline = isInitialBaseline,
            modelVersion = modelVersion,
            bankVersion = bankVersion,
            topicScoresJson = topicScoresJson,
            coverageSummary = coverageSummary
        )
    }

    companion object {
        fun encodeTopicScoresJson(records: List<TopicScoreRecord>): String {
            val arr = JSONArray()
            records.forEach { rec ->
                arr.put(
                    JSONObject().apply {
                        put("topicKey", rec.topicKey)
                        put("topicName", rec.topicName)
                        put("domainId", rec.domainId)
                        put("domainName", rec.domainName)
                        put("correctCount", rec.correctCount)
                        put("totalCount", rec.totalCount)
                        put("percentage", rec.percentage)
                        put("confidence", rec.confidence.name)
                    }
                )
            }
            return arr.toString()
        }

        fun parseTopicScoresJson(raw: String): List<TopicScoreRecord> {
            if (raw.isBlank() || raw == "[]") return emptyList()
            return try {
                val arr = JSONArray(raw)
                (0 until arr.length()).map { i ->
                    val obj = arr.getJSONObject(i)
                    val conf = try {
                        EvidenceConfidence.valueOf(obj.optString("confidence", "UNASSESSED"))
                    } catch (_: Exception) {
                        EvidenceConfidence.UNASSESSED
                    }
                    TopicScoreRecord(
                        topicKey = obj.optString("topicKey", ""),
                        topicName = obj.optString("topicName", ""),
                        domainId = obj.optString("domainId", ""),
                        domainName = obj.optString("domainName", ""),
                        correctCount = obj.optInt("correctCount", 0),
                        totalCount = obj.optInt("totalCount", 0),
                        percentage = obj.optInt("percentage", 0),
                        confidence = conf
                    )
                }
            } catch (_: Exception) {
                emptyList()
            }
        }

        fun fromSession(
            session: ExamSession,
            attemptNumber: Int,
            optionSwitchCount: Int = 0
        ): SimulationScoreEntity {
            val array = JSONArray()
            session.domainScores.forEach { ds ->
                val obj = JSONObject()
                obj.put("domainId", ds.domainId)
                obj.put("domainName", ds.domainName)
                obj.put("scorePercent", ds.percentage)
                obj.put("correctCount", ds.correctCount)
                obj.put("totalCount", ds.totalCount)
                array.put(obj)
            }

            return SimulationScoreEntity(
                id = session.sessionId,
                examId = session.examId,
                timestampMillis = session.completedTimeMillis,
                overallScorePercent = session.scorePercent,
                isPassed = session.isPassed,
                timeSpentSeconds = session.durationSeconds,
                totalQuestions = session.totalQuestions,
                attemptNumber = attemptNumber,
                domainScoresJson = array.toString(),
                mode = session.mode.name,
                startTimeMillis = session.startTimeMillis,
                questionIdsJson = ActiveExamAttemptEntity.encodeStringList(session.questionIds),
                userAnswersJson = ActiveExamAttemptEntity.encodeIntIntMap(session.userAnswers),
                flaggedIndicesJson = ActiveExamAttemptEntity.encodeIntSet(session.flaggedIndices),
                struckOptionsJson = ActiveExamAttemptEntity.encodeIntSetMap(session.struckOptions),
                optionSwitchCount = optionSwitchCount,
                isInitialBaseline = session.isInitialBaseline,
                bankVersion = session.bankVersion,
                modelVersion = session.modelVersion,
                topicScoresJson = session.topicScoresJson,
                coverageSummary = session.coverageSummary
            )
        }

        fun createHistoricalAttempt(
            id: String,
            examId: String,
            timestampMillis: Long,
            overallScore: Int,
            isPassed: Boolean,
            timeSpentSeconds: Int,
            totalQuestions: Int,
            attemptNumber: Int,
            domainScores: List<DomainScoreRecord>
        ): SimulationScoreEntity {
            val array = JSONArray()
            domainScores.forEach { ds ->
                val obj = JSONObject()
                obj.put("domainId", ds.domainId)
                obj.put("domainName", ds.domainName)
                obj.put("scorePercent", ds.scorePercent)
                obj.put("correctCount", ds.correctCount)
                obj.put("totalCount", ds.totalCount)
                array.put(obj)
            }
            return SimulationScoreEntity(
                id = id,
                examId = examId,
                timestampMillis = timestampMillis,
                overallScorePercent = overallScore,
                isPassed = isPassed,
                timeSpentSeconds = timeSpentSeconds,
                totalQuestions = totalQuestions,
                attemptNumber = attemptNumber,
                domainScoresJson = array.toString()
            )
        }
    }
}

data class DomainScoreRecord(
    val domainId: String,
    val domainName: String,
    val scorePercent: Int,
    val correctCount: Int = 0,
    val totalCount: Int = 0
)
