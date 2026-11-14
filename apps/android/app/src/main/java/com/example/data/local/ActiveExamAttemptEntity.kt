package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.model.ExamMode
import org.json.JSONArray
import org.json.JSONObject

/**
 * Persists an in-progress timed simulation or practice drill locally in Room SQLite
 * so users can pause, close, or restart the app and resume seamlessly without losing
 * question order, selected answers, flags, distractor strikes, or remaining time.
 */
@Entity(tableName = "active_exam_attempt")
data class ActiveExamAttemptEntity(
    @PrimaryKey val examId: String,
    val mode: String,
    val questionIdsJson: String,
    val currentIndex: Int,
    val userAnswersJson: String,
    val flaggedIndicesJson: String,
    val struckOptionsJson: String,
    val optionSwitchCountsJson: String,
    val remainingSeconds: Int,
    val isPaused: Boolean,
    val startedAtMillis: Long,
    val updatedAtMillis: Long
) {
    fun parseExamMode(): ExamMode = try {
        ExamMode.valueOf(mode)
    } catch (_: Exception) {
        ExamMode.FULL_SIMULATION
    }

    fun parseQuestionIds(): List<String> = parseStringList(questionIdsJson)
    fun parseUserAnswers(): Map<Int, Int> = parseIntIntMap(userAnswersJson)
    fun parseFlaggedIndices(): Set<Int> = parseIntSet(flaggedIndicesJson)
    fun parseStruckOptions(): Map<Int, Set<Int>> = parseIntSetMap(struckOptionsJson)
    fun parseOptionSwitchCounts(): Map<Int, Int> = parseIntIntMap(optionSwitchCountsJson)

    companion object {
        fun encodeStringList(items: List<String>): String =
            JSONArray().apply { items.forEach { put(it) } }.toString()

        fun parseStringList(raw: String): List<String> = try {
            val arr = JSONArray(raw)
            (0 until arr.length()).map { arr.getString(it) }
        } catch (_: Exception) {
            emptyList()
        }

        fun encodeIntSet(items: Set<Int>): String =
            JSONArray().apply { items.sorted().forEach { put(it) } }.toString()

        fun parseIntSet(raw: String): Set<Int> = try {
            val arr = JSONArray(raw)
            (0 until arr.length()).map { arr.getInt(it) }.toSet()
        } catch (_: Exception) {
            emptySet()
        }

        fun encodeIntIntMap(map: Map<Int, Int>): String =
            JSONObject().apply { map.forEach { (k, v) -> put(k.toString(), v) } }.toString()

        fun parseIntIntMap(raw: String): Map<Int, Int> = try {
            val obj = JSONObject(raw)
            val result = mutableMapOf<Int, Int>()
            val keys = obj.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                key.toIntOrNull()?.let { result[it] = obj.getInt(key) }
            }
            result
        } catch (_: Exception) {
            emptyMap()
        }

        fun encodeIntSetMap(map: Map<Int, Set<Int>>): String =
            JSONObject().apply {
                map.forEach { (k, set) ->
                    val arr = JSONArray().apply { set.sorted().forEach { put(it) } }
                    put(k.toString(), arr)
                }
            }.toString()

        fun parseIntSetMap(raw: String): Map<Int, Set<Int>> = try {
            val obj = JSONObject(raw)
            val result = mutableMapOf<Int, Set<Int>>()
            val keys = obj.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val kInt = key.toIntOrNull() ?: continue
                val arr = obj.getJSONArray(key)
                result[kInt] = (0 until arr.length()).map { arr.getInt(it) }.toSet()
            }
            result
        } catch (_: Exception) {
            emptyMap()
        }
    }
}
