package com.example.model

enum class QuestionDifficulty {
    EASY, MEDIUM, HARD
}

enum class QuestionPool {
    GENERAL,
    PRACTICE,
    ASSESSMENT,
    FULL_EXAM_RESERVED
}

data class SourceCitation(
    val title: String,
    val sectionOrPage: String,
    val standardOrFramework: String
)

data class Question(
    val id: String,
    val examId: String,
    val domainId: String,
    val domainName: String,
    val questionText: String,
    val options: List<String>,
    val correctIndex: Int,
    val explanation: String,
    val optionAnalysis: Map<Int, String> = emptyMap(),
    val citation: SourceCitation,
    val difficulty: QuestionDifficulty = QuestionDifficulty.MEDIUM,
    val topicId: String = "",
    val topicName: String = "",
    val objectiveId: String = "",
    val learningObjective: String = "",
    val questionType: String = "MULTIPLE_CHOICE",
    val questionPool: QuestionPool = QuestionPool.GENERAL,
    val nearDuplicateGroupId: String = "",
    val difficultyExplicit: Boolean = false
)
