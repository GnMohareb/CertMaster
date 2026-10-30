package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.model.Flashcard
import com.example.model.FlashcardStatus

@Entity(tableName = "cached_flashcards")
data class FlashcardEntity(
    @PrimaryKey
    val id: String,
    val examId: String,
    val domainId: String,
    val domainName: String,
    val frontPrompt: String,
    val backAnswer: String,
    val keyFormulaOrRule: String,
    val sourceCitation: String,
    val sourceDocId: String? = null,
    val boxLevel: Int = 1,
    val status: String = FlashcardStatus.fromBoxLevel(boxLevel).name,
    val lastReviewedEpoch: Long = System.currentTimeMillis()
) {
    fun toFlashcard(): Flashcard {
        val parsedStatus = try {
            FlashcardStatus.valueOf(status)
        } catch (e: Exception) {
            FlashcardStatus.fromBoxLevel(boxLevel)
        }
        return Flashcard(
            id = id,
            examId = examId,
            domainId = domainId,
            domainName = domainName,
            frontPrompt = frontPrompt,
            backAnswer = backAnswer,
            keyFormulaOrRule = keyFormulaOrRule,
            sourceCitation = sourceCitation,
            sourceDocId = sourceDocId,
            boxLevel = boxLevel,
            status = parsedStatus
        )
    }

    companion object {
        fun fromFlashcard(card: Flashcard, lastReviewed: Long = System.currentTimeMillis()): FlashcardEntity =
            FlashcardEntity(
                id = card.id,
                examId = card.examId,
                domainId = card.domainId,
                domainName = card.domainName,
                frontPrompt = card.frontPrompt,
                backAnswer = card.backAnswer,
                keyFormulaOrRule = card.keyFormulaOrRule,
                sourceCitation = card.sourceCitation,
                sourceDocId = card.sourceDocId,
                boxLevel = card.boxLevel,
                status = card.status.name,
                lastReviewedEpoch = lastReviewed
            )
    }
}
