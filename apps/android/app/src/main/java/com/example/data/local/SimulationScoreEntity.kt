package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.model.DomainScore
import com.example.model.ExamSession
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
    val optionSwitchCount: Int = 0
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
            questionIds = ActiveExamAttemptEntity.parseStringList(questionIdsJson)
        )
    }

    companion object {
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
                optionSwitchCount = optionSwitchCount
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
