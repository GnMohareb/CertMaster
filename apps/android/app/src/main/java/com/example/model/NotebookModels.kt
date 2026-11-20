package com.example.model

enum class SourceType {
    OFFICIAL_GUIDE,
    STANDARD_SPEC,
    CHEAT_SHEET,
    SYLLABUS,
    AUDIO_TRANSCRIPT
}

enum class FlashcardStatus {
    UNREVIEWED,
    KNOWN,
    NEEDS_REVIEW;

    companion object {
        fun fromBoxLevel(boxLevel: Int): FlashcardStatus = when {
            boxLevel >= 3 -> KNOWN
            boxLevel == 2 -> NEEDS_REVIEW
            else -> UNREVIEWED
        }
    }
}

data class SourceDoc(
    val id: String,
    val examId: String,
    val domainId: String,
    val domainName: String,
    val title: String,
    val authorOrStandard: String,
    val type: SourceType,
    val summary: String,
    val keyTakeaways: List<String>,
    val fullContent: String
)

data class DialogueTurn(
    val speaker: String, // e.g. "Alex (Host)" or "Dr. Maya (CISSP Architect)"
    val text: String,
    val timestampSeconds: Int,
    val audioAssetPath: String? = null
)

data class AudioOverview(
    val id: String,
    val examId: String,
    val domainId: String,
    val title: String,
    val subtitle: String,
    val durationSeconds: Int,
    val host1: String = "Alex (Host)",
    val host2: String = "Dr. Maya (Exam Expert)",
    val turns: List<DialogueTurn>,
    val keyConceptsCovered: List<String>
)

data class AITutorMessage(
    val id: String,
    val isUser: Boolean,
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val citedSource: String? = null
)

data class Flashcard(
    val id: String,
    val examId: String,
    val domainId: String,
    val domainName: String,
    val frontPrompt: String,
    val backAnswer: String,
    val keyFormulaOrRule: String,
    val sourceCitation: String,
    val sourceDocId: String? = null,
    var boxLevel: Int = 1, // Leitner box 1 to 5
    val status: FlashcardStatus = FlashcardStatus.fromBoxLevel(boxLevel)
)
