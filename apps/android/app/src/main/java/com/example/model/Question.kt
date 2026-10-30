package com.example.model

enum class QuestionDifficulty {
    EASY, MEDIUM, HARD
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
    val difficulty: QuestionDifficulty = QuestionDifficulty.MEDIUM
)
