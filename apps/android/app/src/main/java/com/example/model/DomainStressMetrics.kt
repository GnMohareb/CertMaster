package com.example.model

enum class StressLevel {
    CRITICAL_STRESS, // < 50% accuracy or severe hesitation + high flags
    HIGH_ATTENTION,  // 50% - 69% accuracy or heavy struggle
    MODERATE_PRACTICE, // 70% - 84% passing but needs maintenance
    ON_TRACK,        // 85% - 94% solid
    MASTERED         // >= 95% confident
}

data class DomainStressMetrics(
    val domainId: String,
    val domainNumber: Int,
    val domainName: String,
    val weightPercent: Int,
    val accuracyPercent: Int,
    val questionsAttempted: Int,
    val avgResponseSeconds: Int, // e.g. 82s (benchmark is 60s)
    val flagRatePercent: Int,    // user flagged these questions because of doubt
    val stressScore: Int,        // 0 to 100 urgency index
    val stressLevel: StressLevel,
    val aiStressDiagnosis: String,
    val keyTopicsNeedingFocus: List<String>
)
