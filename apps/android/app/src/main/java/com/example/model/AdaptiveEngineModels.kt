package com.example.model

/**
 * Configurable parameters for the offline deterministic mastery, assessment, and adaptive practice engine.
 * Mastery is an evidence-weighted practice signal, not a psychometric pass-probability guarantee.
 */
data class AdaptiveConfig(
    val modelVersion: String = DEFAULT_MODEL_VERSION,
    val initialAssessmentDefaultLength: Int = 20,
    val defaultPracticeSessionLength: Int = 10,
    val weakThresholdPercent: Int = 65,
    val masteredThresholdPercent: Int = 80,
    val priorMasteryPercent: Double = 50.0,
    val correctMasteryStepBase: Double = 14.0,
    val incorrectMasteryPenaltyBase: Double = 16.0,
    val repeatExposureDecayFactor: Double = 0.5,
    val minQuestionsForConfidence: Int = 3,
    val minUniqueQuestionsForEstablished: Int = 2,
    val maxUnestablishedMasteryPercent: Int = 74,
    val remediationInterveningQuestions: Int = 2,
    val weakTopicWeightPercent: Int = 45,
    val insufficientEvidenceWeightPercent: Int = 25,
    val retentionReviewWeightPercent: Int = 20,
    val maintenanceStrongWeightPercent: Int = 10,
    val lowMasteryReviewHours: Long = 12L,
    val emergingMasteryReviewHours: Long = 24L,
    val establishedMasteryReviewHours: Long = 72L
) {
    companion object {
        const val DEFAULT_MODEL_VERSION = "offline-mastery-v1"
    }
}

enum class EvidenceConfidence {
    UNASSESSED,
    INSUFFICIENT_EVIDENCE,
    EMERGING,
    ESTABLISHED;

    fun displayLabel(): String = when (this) {
        UNASSESSED -> "Not assessed"
        INSUFFICIENT_EVIDENCE -> "Insufficient evidence"
        EMERGING -> "Emerging evidence"
        ESTABLISHED -> "Established evidence"
    }
}

data class TopicMasteryState(
    val examId: String,
    val topicKey: String,
    val topicName: String,
    val domainId: String,
    val domainName: String,
    val masteryPercent: Int,
    val accuracyPercent: Int,
    val attemptCount: Int,
    val correctCount: Int,
    val uniqueQuestionIds: Set<String>,
    val baselineScorePercent: Int? = null,
    val baselineAttemptCount: Int = 0,
    val confidence: EvidenceConfidence = EvidenceConfidence.UNASSESSED,
    val lastDifficulty: QuestionDifficulty = QuestionDifficulty.MEDIUM,
    val consecutiveCorrect: Int = 0,
    val consecutiveIncorrect: Int = 0,
    val lastReviewedAtMillis: Long = 0L,
    val nextReviewDueAtMillis: Long = 0L,
    val modelVersion: String = AdaptiveConfig.DEFAULT_MODEL_VERSION,
    val bankVersion: String = "1",
    val hasExplicitTopicMapping: Boolean = true
) {
    val uniqueQuestionCount: Int get() = uniqueQuestionIds.size
    val isAssessed: Boolean get() = attemptCount > 0
}

data class DomainMasterySummary(
    val domainId: String,
    val domainName: String,
    val masteryPercent: Int,
    val accuracyPercent: Int,
    val attemptCount: Int,
    val correctCount: Int,
    val uniqueQuestionCount: Int,
    val confidence: EvidenceConfidence,
    val baselineScorePercent: Int?,
    val totalTopicsInBank: Int,
    val assessedTopicsCount: Int,
    val isWeak: Boolean,
    val dueForReviewCount: Int
) {
    val isAssessed: Boolean get() = attemptCount > 0
}

data class TopicScoreRecord(
    val topicKey: String,
    val topicName: String,
    val domainId: String,
    val domainName: String,
    val correctCount: Int,
    val totalCount: Int,
    val percentage: Int,
    val confidence: EvidenceConfidence
)

data class QuestionExposureState(
    val examId: String,
    val questionId: String,
    val exposureCount: Int = 0,
    val correctCount: Int = 0,
    val incorrectCount: Int = 0,
    val lastCorrect: Boolean = false,
    val lastGlobalOrder: Long = 0L,
    val dueReviewAfterOrder: Long = 0L,
    val lastAnsweredAtMillis: Long = 0L,
    val nextReviewDueAtMillis: Long = 0L
)

data class SimulationPaper(
    val id: String,
    val title: String,
    val description: String = "",
    val durationMinutes: Int = 120,
    val questionIds: List<String> = emptyList()
)

data class EmbeddedBankMetadata(
    val schemaVersion: Int = 1,
    val examId: String = "csc-part-1",
    val bankVersion: String = "1",
    val syllabusEdition: String = "",
    val syllabusWeights: Map<String, Int> = emptyMap(),
    val simulationPapers: List<SimulationPaper> = emptyList(),
    val diagnosticQuestionIds: List<String> = emptyList()
)

data class EmbeddedBankLoadResult(
    val metadata: EmbeddedBankMetadata,
    val questions: List<Question>
)

data class BankCoverageAudit(
    val totalQuestions: Int,
    val practiceEligibleCount: Int,
    val assessmentEligibleCount: Int,
    val reservedFullExamCount: Int,
    val domainsCount: Int,
    val topicsCount: Int,
    val unmappedTopicQuestionCount: Int,
    val missingObjectiveCount: Int,
    val missingOptionAnalysisCount: Int,
    val missingExplicitDifficultyCount: Int,
    val usesSyllabusWeights: Boolean,
    val coverageDescription: String,
    val simulationPapersCount: Int = 0
)

data class PracticeRecommendation(
    val id: String,
    val title: String,
    val reason: String,
    val mode: ExamMode,
    val targetDomainId: String? = null,
    val targetTopicKey: String? = null,
    val badgeLabel: String,
    val priority: Int
)

data class AdaptiveSelectionResult(
    val questions: List<Question>,
    val selectionReasons: Map<String, String>,
    val isBankExhausted: Boolean,
    val exhaustionNotice: String? = null
)

data class RemediationEntry(
    val questionId: String,
    val dueAfterStep: Int,
    val reason: String
)

data class PracticeAnswerFeedback(
    val questionId: String,
    val questionIndex: Int,
    val selectedIndex: Int,
    val correctIndex: Int,
    val isCorrect: Boolean,
    val explanation: String,
    val selectedOptionAnalysis: String?,
    val correctOptionAnalysis: String?,
    val learningObjective: String,
    val citationTitle: String,
    val citationSection: String,
    val remediationQuestionId: String?,
    val remediationNotice: String?,
    val updatedTopicMastery: TopicMasteryState?
)

