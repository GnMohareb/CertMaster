package com.example.model

data class ExamConfig(
    val id: String,
    val title: String,
    val shortCode: String,
    val issuer: String,
    val description: String,
    val passingScorePercent: Int = 70,
    val defaultSimulationCount: Int = 50,
    val totalBankQuestions: Int = 150,
    val durationMinutes: Int = 120,
    val domains: List<ExamDomain>,
    val primaryColorHex: Long = 0xFF2563EB,
    val iconName: String = "Security"
)

data class ExamDomain(
    val id: String,
    val number: Int,
    val title: String,
    val weightPercent: Int,
    val description: String,
    val keyFrameworks: List<String> = emptyList(),
    val iconName: String = "Check"
)
