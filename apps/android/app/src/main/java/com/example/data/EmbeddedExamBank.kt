package com.example.data

import android.content.Context
import com.example.model.Question
import com.example.model.QuestionDifficulty
import com.example.model.SourceCitation
import org.json.JSONObject

/**
 * Standalone APK question-bank reader. No network or Firebase dependencies.
 *
 * Assets: src/<flavor>/assets/exams/<examId>.json
 * Each bank must identify its certification and contain complete, validated questions.
 * Fail closed: an absent/invalid bank must never fall back to another exam.
 */
object EmbeddedExamBank {
    fun load(context: Context, examId: String): List<Question> {
        require(Regex("[a-z0-9-]+").matches(examId)) { "Invalid exam ID" }
        val json = try {
            context.assets.open("exams/$examId.json").bufferedReader(Charsets.UTF_8).use { it.readText() }
        } catch (e: java.io.IOException) {
            throw IllegalStateException("No embedded question bank for $examId", e)
        }
        return parse(json, examId)
    }

    fun parse(json: String, expectedExamId: String): List<Question> {
        val root = JSONObject(json)
        require(root.getInt("schemaVersion") == 1) { "Unsupported question bank schema" }
        require(root.getString("examId") == expectedExamId) { "Question bank exam mismatch" }
        val entries = root.getJSONArray("questions")
        require(entries.length() > 0) { "Question bank is empty" }
        val seen = mutableSetOf<String>()
        return (0 until entries.length()).map { i ->
            val item = entries.getJSONObject(i)
            val id = item.getString("id").trim()
            require(id.isNotEmpty() && seen.add(id)) { "Blank or duplicate question ID: $id" }
            val optionsArray = item.getJSONArray("options")
            val options = (0 until optionsArray.length()).map { optionsArray.getString(it).trim() }
            require(options.size >= 2 && options.all { it.isNotEmpty() }) { "Invalid options: $id" }
            val correct = item.getInt("correctIndex")
            require(correct in options.indices) { "Invalid correct answer: $id" }
            val citation = item.getJSONObject("citation")
            val difficulty = QuestionDifficulty.valueOf(item.optString("difficulty", "MEDIUM"))
            val text = item.getString("questionText").trim()
            val explanation = item.getString("explanation").trim()
            require(text.isNotEmpty() && explanation.isNotEmpty()) { "Missing text/explanation: $id" }
            Question(
                id = id,
                examId = expectedExamId,
                domainId = item.getString("domainId"),
                domainName = item.getString("domainName"),
                questionText = text,
                options = options,
                correctIndex = correct,
                explanation = explanation,
                citation = SourceCitation(
                    title = citation.getString("title"),
                    sectionOrPage = citation.getString("sectionOrPage"),
                    standardOrFramework = citation.getString("standardOrFramework")
                ),
                difficulty = difficulty
            )
        }
    }
}
