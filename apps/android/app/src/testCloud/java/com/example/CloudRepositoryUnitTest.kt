package com.example

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.ExamRepository
import com.example.data.local.CertDatabase
import com.example.model.SubStatus
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class CloudRepositoryUnitTest {

    private lateinit var context: Context
    private lateinit var database: CertDatabase

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        database = Room.inMemoryDatabaseBuilder(context, CertDatabase::class.java)
            .allowMainThreadQueries()
            .build()
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun examRepository_calculatesReadinessAndDiagnostics() {
        val repository = ExamRepository()
        val readiness = repository.calculateReadinessScore()
        assertTrue("Readiness score must be between 10 and 100", readiness in 10..100)

        repository.getWeakestDomain()

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

    @Test
    fun examRepository_integratesWithRoomCache() = runBlocking {
        val repo = ExamRepository(context = context, database = database)
        assertTrue("Repository should have database attached", repo.isRoomDatabaseAttached())
        assertTrue("Offline cache should be active", repo.isOfflineCacheActive.value)

        kotlinx.coroutines.delay(150)

        val sources = repo.sources.value
        assertTrue("Repository should have study sources loaded", sources.isNotEmpty())

        val flashcards = repo.flashcards.value
        assertTrue("Repository should have flashcards loaded", flashcards.isNotEmpty())

        val firstCard = flashcards.first()
        repo.updateFlashcardBox(firstCard.id, 4)
        kotlinx.coroutines.delay(100)

        val updatedCard = database.flashcardDao().getFlashcardById(firstCard.id)
        assertNotNull(updatedCard)
        assertEquals(4, updatedCard?.boxLevel)
    }

    @Test
    fun examRepository_handlesSubscriptionAndProfileSync() = runBlocking {
        val repo = ExamRepository(context = context, database = database)
        val initialProfile = repo.userProfile.value
        assertNotNull(initialProfile)
        assertEquals("", initialProfile.userId)
        assertEquals("", initialProfile.displayName)
        assertTrue(initialProfile.subscriptions.isEmpty())
        assertEquals("Free Trial", initialProfile.subscriptionTier)

        repo.subscribeToSubject("sec_plus")
        val secPlusSub = repo.userProfile.value.subscriptions.firstOrNull { it.examId == "sec_plus" }
        assertTrue(secPlusSub == null || secPlusSub.status != SubStatus.ACTIVE)
    }
}
