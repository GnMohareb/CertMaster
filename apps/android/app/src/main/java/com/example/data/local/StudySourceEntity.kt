package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.model.SourceDoc
import com.example.model.SourceType

@Entity(tableName = "study_sources")
data class StudySourceEntity(
    @PrimaryKey
    val id: String,
    val examId: String,
    val domainId: String,
    val domainName: String,
    val title: String,
    val authorOrStandard: String,
    val type: SourceType,
    val summary: String,
    val keyTakeaways: List<String>,
    val fullContent: String,
    val cachedAtMillis: Long = System.currentTimeMillis()
) {
    fun toSourceDoc(): SourceDoc = SourceDoc(
        id = id,
        examId = examId,
        domainId = domainId,
        domainName = domainName,
        title = title,
        authorOrStandard = authorOrStandard,
        type = type,
        summary = summary,
        keyTakeaways = keyTakeaways,
        fullContent = fullContent
    )

    companion object {
        fun fromSourceDoc(doc: SourceDoc): StudySourceEntity = StudySourceEntity(
            id = doc.id,
            examId = doc.examId,
            domainId = doc.domainId,
            domainName = doc.domainName,
            title = doc.title,
            authorOrStandard = doc.authorOrStandard,
            type = doc.type,
            summary = doc.summary,
            keyTakeaways = doc.keyTakeaways,
            fullContent = doc.fullContent
        )
    }
}
