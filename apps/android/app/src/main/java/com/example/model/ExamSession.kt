package com.example.model

enum class ExamMode {
    FULL_SIMULATION,
    DOMAIN_PRACTICE,
    AI_ADAPTIVE_DRILL,
    AI_STRESS_STUDY,
    FLASHCARDS,
    INITIAL_BEHAVIORAL_ASSESSMENT
}

data class DomainScore(
    val domainId: String,
    val domainName: String,
    val correctCount: Int,
    val totalCount: Int,
    val percentage: Int
)

data class ExamSession(
    val sessionId: String,
    val examId: String,
    val mode: ExamMode,
    val startTimeMillis: Long,
    val durationSeconds: Int,
    val totalQuestions: Int,
    val userAnswers: Map<Int, Int>, // question index -> option index
    val flaggedIndices: Set<Int>,
    val struckOptions: Map<Int, Set<Int>> = emptyMap(), // question index -> struck option indices
    val completedTimeMillis: Long,
    val scorePercent: Int,
    val isPassed: Boolean,
    val domainScores: List<DomainScore>
)
