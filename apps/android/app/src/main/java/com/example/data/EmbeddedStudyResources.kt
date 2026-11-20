package com.example.data

import android.content.Context
import com.example.model.AudioOverview
import com.example.model.DialogueTurn
import com.example.model.Flashcard
import org.json.JSONArray
import org.json.JSONObject

internal data class EmbeddedStudyResources(
    val flashcards: List<Flashcard> = emptyList(),
    val audio: List<AudioOverview> = emptyList()
) {
    companion object {
        fun load(context: Context?, examId: String, domainNames: Map<String, String>): EmbeddedStudyResources {
            val assets = context?.assets ?: return EmbeddedStudyResources()
            val directory = "study/$examId"
            if (assets.list(directory)?.contains("study.json") != true) return EmbeddedStudyResources()

            val data = assets.open("$directory/study.json").bufferedReader().use { JSONObject(it.readText()) }
            val flashcards = data.getJSONArray("flashcards").read { card ->
                val domainId = card.getString("domainId")
                Flashcard(
                    id = card.getString("id"),
                    examId = examId,
                    domainId = domainId,
                    domainName = domainNames[domainId] ?: domainId,
                    frontPrompt = card.getString("frontPrompt"),
                    backAnswer = card.getString("backAnswer"),
                    keyFormulaOrRule = card.getString("keyFormulaOrRule"),
                    sourceCitation = "CertMaster study notes · Canadian Securities Institute curriculum"
                )
            }
            val audio = data.getJSONArray("audio").read { lesson ->
                val turns = lesson.getJSONArray("turns").read { turn ->
                    DialogueTurn(
                        speaker = turn.getString("speaker"),
                        text = turn.getString("text"),
                        timestampSeconds = turn.getInt("timestampSeconds"),
                        audioAssetPath = "$directory/${turn.getString("file")}"
                    )
                }
                val concepts = lesson.getJSONArray("concepts")
                AudioOverview(
                    id = lesson.getString("id"),
                    examId = examId,
                    domainId = lesson.getString("domainId"),
                    title = lesson.getString("title"),
                    subtitle = lesson.getString("subtitle"),
                    durationSeconds = lesson.getInt("durationSeconds"),
                    host1 = "Alex",
                    host2 = "Maya",
                    turns = turns,
                    keyConceptsCovered = List(concepts.length(), concepts::getString)
                )
            }
            return EmbeddedStudyResources(flashcards, audio)
        }

        private fun <T> JSONArray.read(convert: (JSONObject) -> T): List<T> =
            List(length()) { convert(getJSONObject(it)) }
    }
}
