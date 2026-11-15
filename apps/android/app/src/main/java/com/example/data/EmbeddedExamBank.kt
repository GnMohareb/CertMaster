package com.example.data

import android.content.Context
import com.example.model.BankCoverageAudit
import com.example.model.EmbeddedBankLoadResult
import com.example.model.EmbeddedBankMetadata
import com.example.model.Question
import com.example.model.QuestionDifficulty
import com.example.model.QuestionPool
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
    fun load(context: Context, examId: String): List<Question> =
        loadWithMetadata(context, examId).questions

    fun loadWithMetadata(context: Context, examId: String): EmbeddedBankLoadResult {
        require(Regex("[a-z0-9-]+").matches(examId)) { "Invalid exam ID" }
        val json = try {
            context.assets.open("exams/$examId.json").bufferedReader(Charsets.UTF_8).use { it.readText() }
        } catch (e: java.io.IOException) {
            throw IllegalStateException("No embedded question bank for $examId", e)
        }
        return parseWithMetadata(json, examId)
    }

    fun parse(json: String, expectedExamId: String): List<Question> =
        parseWithMetadata(json, expectedExamId).questions

    fun parseWithMetadata(json: String, expectedExamId: String): EmbeddedBankLoadResult {
        val root = JSONObject(json)
        val schemaVersion = root.getInt("schemaVersion")
        require(schemaVersion in 1..2) { "Unsupported question bank schema: $schemaVersion" }
        require(root.getString("examId") == expectedExamId) { "Question bank exam mismatch" }

        val bankVersion = root.optString("bankVersion", "1").trim().ifEmpty { "1" }
        val syllabusEdition = root.optString("syllabusEdition", "").trim()
        val syllabusWeights = parseSyllabusWeights(root.optJSONObject("syllabusWeights"))

        val entries = root.getJSONArray("questions")
        require(entries.length() > 0) { "Question bank is empty" }
        val seen = mutableSetOf<String>()
        val questions = (0 until entries.length()).map { i ->
            val item = entries.getJSONObject(i)
            val id = item.getString("id").trim()
            require(id.isNotEmpty() && seen.add(id)) { "Blank or duplicate question ID: $id" }
            val domainId = item.getString("domainId").trim()
            val domainName = item.getString("domainName").trim()
            require(domainId.isNotEmpty() && domainName.isNotEmpty()) { "Missing domain metadata: $id" }

            val optionsArray = item.getJSONArray("options")
            val options = (0 until optionsArray.length()).map { optionsArray.getString(it).trim() }
            require(options.size >= 2 && options.all { it.isNotEmpty() }) { "Invalid options: $id" }
            val correct = item.getInt("correctIndex")
            require(correct in options.indices) { "Invalid correct answer: $id" }
            val citation = item.getJSONObject("citation")
            val citationTitle = citation.getString("title").trim()
            val citationSection = citation.getString("sectionOrPage").trim()
            val citationStandard = citation.getString("standardOrFramework").trim()
            require(
                citationTitle.isNotEmpty() &&
                    citationSection.isNotEmpty() &&
                    citationStandard.isNotEmpty()
            ) { "Incomplete citation metadata: $id" }

            val hasExplicitDifficulty = item.has("difficulty") &&
                !item.isNull("difficulty") &&
                item.optString("difficulty").trim().isNotEmpty()
            val difficultyRaw = if (hasExplicitDifficulty) item.getString("difficulty").trim().uppercase() else "MEDIUM"
            val difficulty = QuestionDifficulty.valueOf(difficultyRaw)

            val text = item.getString("questionText").trim()
            val explanation = item.getString("explanation").trim()
            require(text.isNotEmpty() && explanation.isNotEmpty()) { "Missing text/explanation: $id" }

            val optionAnalysis = parseOptionAnalysis(item.optJSONObject("optionAnalysis"), options.size)
            val topicId = item.optString("topicId", "").trim()
            val topicName = item.optString("topicName", "").trim()
            val objectiveId = item.optString("objectiveId", "").trim()
            val learningObjective = item.optString("learningObjective", "").trim()
            val questionTypeRaw = item.optString("questionType", "MULTIPLE_CHOICE")
                .trim()
                .uppercase()
                .ifEmpty { "MULTIPLE_CHOICE" }
            require(
                questionTypeRaw in setOf("MULTIPLE_CHOICE", "SCENARIO_MCQ", "CALCULATION_MCQ")
            ) { "Unsupported questionType '$questionTypeRaw' for $id" }
            val nearDuplicateGroupId = item.optString("nearDuplicateGroupId", "").trim()
            val poolRaw = item.optString("questionPool", item.optString("pool", "GENERAL")).trim().uppercase()
            val questionPool = parseQuestionPool(poolRaw)

            Question(
                id = id,
                examId = expectedExamId,
                domainId = domainId,
                domainName = domainName,
                questionText = text,
                options = options,
                correctIndex = correct,
                explanation = explanation,
                optionAnalysis = optionAnalysis,
                citation = SourceCitation(
                    title = citationTitle,
                    sectionOrPage = citationSection,
                    standardOrFramework = citationStandard
                ),
                difficulty = difficulty,
                topicId = topicId,
                topicName = topicName,
                objectiveId = objectiveId,
                learningObjective = learningObjective,
                questionType = questionTypeRaw,
                questionPool = questionPool,
                nearDuplicateGroupId = nearDuplicateGroupId,
                difficultyExplicit = hasExplicitDifficulty
            )
        }
        return EmbeddedBankLoadResult(
            metadata = EmbeddedBankMetadata(
                schemaVersion = schemaVersion,
                examId = expectedExamId,
                bankVersion = bankVersion,
                syllabusEdition = syllabusEdition,
                syllabusWeights = syllabusWeights
            ),
            questions = questions
        )
    }

    private fun parseSyllabusWeights(obj: JSONObject?): Map<String, Int> {
        if (obj == null) return emptyMap()
        val result = linkedMapOf<String, Int>()
        val keys = obj.keys()
        while (keys.hasNext()) {
            val key = keys.next().trim()
            val value = obj.optInt(key, 0)
            if (key.isNotEmpty() && value > 0) {
                result[key] = value
            }
        }
        return result
    }

    private fun parseOptionAnalysis(obj: JSONObject?, optionCount: Int): Map<Int, String> {
        if (obj == null) return emptyMap()
        val result = linkedMapOf<Int, String>()
        val keys = obj.keys()
        while (keys.hasNext()) {
            val rawKey = keys.next().trim()
            val idx = rawKey.toIntOrNull() ?: if (rawKey.length == 1 && rawKey[0].uppercaseChar() in 'A'..'Z') {
                rawKey[0].uppercaseChar() - 'A'
            } else {
                null
            }
            val analysisText = obj.optString(rawKey, "").trim()
            if (idx != null && idx in 0 until optionCount && analysisText.isNotEmpty()) {
                result[idx] = analysisText
            }
        }
        return result
    }

    private fun parseQuestionPool(raw: String): QuestionPool = when (raw) {
        "", "GENERAL", "BOTH" -> QuestionPool.GENERAL
        "PRACTICE", "DRILL" -> QuestionPool.PRACTICE
        "ASSESSMENT", "DIAGNOSTIC" -> QuestionPool.ASSESSMENT
        "FULL_EXAM_RESERVED", "FULL_EXAM", "EXAM_ONLY" -> QuestionPool.FULL_EXAM_RESERVED
        else -> throw IllegalArgumentException("Unsupported question pool: $raw")
    }

    fun auditBank(
        questions: List<Question>,
        metadata: EmbeddedBankMetadata = EmbeddedBankMetadata()
    ): BankCoverageAudit {
        val practiceEligible = questions.count {
            it.questionPool == QuestionPool.GENERAL || it.questionPool == QuestionPool.PRACTICE
        }
        val assessmentEligible = questions.count {
            it.questionPool != QuestionPool.FULL_EXAM_RESERVED
        }
        val reservedFullExam = questions.count { it.questionPool == QuestionPool.FULL_EXAM_RESERVED }
        val domains = questions.map { it.domainId }.distinct()
        val explicitTopics = questions.mapNotNull { q ->
            when {
                q.topicId.isNotBlank() -> q.topicId
                q.topicName.isNotBlank() -> q.topicName
                else -> null
            }
        }.distinct()
        val unmappedTopics = questions.count { it.topicId.isBlank() && it.topicName.isBlank() }
        val missingObjective = questions.count { it.objectiveId.isBlank() && it.learningObjective.isBlank() }
        val missingOptionAnalysis = questions.count { it.optionAnalysis.isEmpty() }
        val missingExplicitDifficulty = questions.count { !it.difficultyExplicit }
        val usesWeights = metadata.syllabusWeights.isNotEmpty() &&
            domains.any { (metadata.syllabusWeights[it] ?: 0) > 0 }

        val coverageDesc = when {
            questions.isEmpty() -> "No practice questions installed yet."
            usesWeights -> "Weighted by verified syllabus weights across ${domains.size} domain(s)."
            else -> "Balanced equally across ${domains.size} available domain(s) (no official syllabus weights bundled)."
        }

        return BankCoverageAudit(
            totalQuestions = questions.size,
            practiceEligibleCount = practiceEligible,
            assessmentEligibleCount = assessmentEligible,
            reservedFullExamCount = reservedFullExam,
            domainsCount = domains.size,
            topicsCount = explicitTopics.size,
            unmappedTopicQuestionCount = unmappedTopics,
            missingObjectiveCount = missingObjective,
            missingOptionAnalysisCount = missingOptionAnalysis,
            missingExplicitDifficultyCount = missingExplicitDifficulty,
            usesSyllabusWeights = usesWeights,
            coverageDescription = coverageDesc
        )
    }
}
