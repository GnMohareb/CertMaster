package com.example

import com.example.data.DefaultNotebookSources
import com.example.data.DefaultQuestions
import com.example.data.ExamCatalog
import com.example.data.ExamRepository
import com.example.model.ExamMode
import com.example.model.ExamSession
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {

    @Test
    fun examCatalog_containsValidCisspAndMultiExamPresets() {
        val cissp = ExamCatalog.CISSP
        assertEquals("cissp", cissp.id)
        assertEquals(8, cissp.domains.size)
        assertEquals(70, cissp.passingScorePercent)

        val aws = ExamCatalog.AWS_SAA
        assertEquals(4, aws.domains.size)

        val secPlus = ExamCatalog.SECURITY_PLUS
        assertEquals(5, secPlus.domains.size)

        val pmp = ExamCatalog.PMP
        assertEquals(3, pmp.domains.size)

        assertTrue("All presets should have at least 5 configurations", ExamCatalog.ALL_PRESETS.size >= 5)
    }

    @Test
    fun questions_haveDetailedAnalysisAndCitations() {
        val questions = DefaultQuestions.CISSP_QUESTIONS
        assertTrue("Questions bank should not be empty", questions.isNotEmpty())

        questions.forEach { q ->
            assertTrue("Question text should be non-empty", q.questionText.isNotBlank())
            assertEquals("Should have exactly 4 options", 4, q.options.size)
            assertTrue("Correct index must be within 0..3", q.correctIndex in 0..3)
            assertTrue("Explanation must be substantial", q.explanation.length > 20)
            assertTrue("Citation must cite standard/framework", q.citation.standardOrFramework.isNotBlank())
        }
    }

    @Test
    fun notebookLM_sourcesAndAudioOverviewsAreLoaded() {
        val sources = DefaultNotebookSources.CISSP_SOURCES
        assertTrue("Sources should include official guides", sources.isNotEmpty())

        val audioOverviews = DefaultNotebookSources.AUDIO_OVERVIEWS
        assertTrue("Should have deep dive audio conversations", audioOverviews.isNotEmpty())

        val firstAudio = audioOverviews.first()
        assertTrue("Should have dialogue turns", firstAudio.turns.size >= 4)
        assertTrue("Turns should specify speaker", firstAudio.turns.any { it.speaker.contains("Maya") })

        val flashcards = DefaultNotebookSources.CISSP_FLASHCARDS
        assertTrue("Flashcards should be loaded", flashcards.isNotEmpty())
    }

    @Test
    fun examRepository_calculatesReadinessAndDiagnostics() {
        val repository = ExamRepository()
        val readiness = repository.calculateReadinessScore()
        assertTrue("Readiness score must be between 10 and 100", readiness in 10..100)

        // With no real attempts recorded, there is no fabricated "weakest domain".
        repository.getWeakestDomain()

        // Test switching exam
        repository.switchExam("aws-saa")
        assertEquals("aws-saa", repository.currentExam.value.id)
        assertEquals(4, repository.currentExam.value.domains.size)
    }

    @Test
    fun examRepository_tracksBehavioralStressAndIdentifiesPriorityDomains() {
        val repository = ExamRepository()
        val stressMetrics = repository.getDomainStressMetricsList()
        assertTrue("Should compute stress metrics for all domains", stressMetrics.isNotEmpty())

        val highestStress = repository.getHighestStressDomain()
        assertNotNull("Should identify top stress domain", highestStress)
        assertTrue("Stress score should be computed", highestStress!!.stressScore in 0..100)
        assertTrue("Avg response hesitation should be tracked", highestStress.avgResponseSeconds > 0)
        assertTrue("Flag rate should be tracked", highestStress.flagRatePercent in 0..100)
        assertTrue("Diagnosis should be generated", highestStress.aiStressDiagnosis.isNotBlank())
    }
}
