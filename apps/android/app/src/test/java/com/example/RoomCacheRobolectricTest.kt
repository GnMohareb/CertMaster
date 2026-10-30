package com.example

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import com.example.data.DefaultNotebookSources
import com.example.data.ExamRepository
import com.example.data.local.CertDatabase
import com.example.data.local.DomainScoreRecord
import com.example.data.local.FlashcardEntity
import com.example.data.local.SimulationScoreEntity
import com.example.data.local.StudySourceEntity
import com.example.model.SourceDoc
import com.example.model.SourceType
import com.example.model.SubStatus
import kotlinx.coroutines.flow.first
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
class RoomCacheRobolectricTest {

    private lateinit var context: Context
    private lateinit var database: CertDatabase

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext<Context>()
        database = Room.inMemoryDatabaseBuilder(context, CertDatabase::class.java)
            .allowMainThreadQueries()
            .build()
    }

    @After
    fun tearDown() {
        database.close()
    }

    @Test
    fun studySourceDao_canInsertAndQuerySources() = runBlocking {
        val testDoc = StudySourceEntity(
            id = "test_src_01",
            examId = "cissp",
            domainId = "d1",
            domainName = "Security & Risk Management",
            title = "NIST SP 800-30 Risk Assessment Guide",
            authorOrStandard = "NIST",
            type = SourceType.OFFICIAL_GUIDE,
            summary = "Step-by-step risk assessment methodology.",
            keyTakeaways = listOf("Identify threat sources", "Determine likelihood and impact", "Calculate risk levels"),
            fullContent = "Full assessment guidelines."
        )

        database.studySourceDao().insertSource(testDoc)

        val retrieved = database.studySourceDao().getSourceById("test_src_01")
        assertNotNull(retrieved)
        assertEquals("NIST SP 800-30 Risk Assessment Guide", retrieved?.title)
        assertEquals(3, retrieved?.keyTakeaways?.size)
        assertEquals("Identify threat sources", retrieved?.keyTakeaways?.first())

        val list = database.studySourceDao().getSourcesByExam("cissp").first()
        assertEquals(1, list.size)
        assertEquals("test_src_01", list.first().id)
    }

    @Test
    fun flashcardDao_canInsertQueryAndUpdateBoxLevel() = runBlocking {
        val testCard = FlashcardEntity(
            id = "test_fc_01",
            examId = "cissp",
            domainId = "d3",
            domainName = "Security Architecture",
            frontPrompt = "What is the Biba model designed for?",
            backAnswer = "Data Integrity (No Read-Down, No Write-Up)",
            keyFormulaOrRule = "Biba = Integrity",
            sourceCitation = "DoD Architecture Specs",
            sourceDocId = "test_src_01",
            boxLevel = 1
        )

        database.flashcardDao().insertFlashcard(testCard)

        var card = database.flashcardDao().getFlashcardById("test_fc_01")
        assertNotNull(card)
        assertEquals(1, card?.boxLevel)

        // Advance to Leitner Box 3
        database.flashcardDao().updateBoxLevel("test_fc_01", 3)
        card = database.flashcardDao().getFlashcardById("test_fc_01")
        assertEquals(3, card?.boxLevel)

        val count = database.flashcardDao().getFlashcardCount("cissp")
        assertEquals(1, count)
    }

    @Test
    fun examRepository_integratesWithRoomCache() = runBlocking {
        val repo = ExamRepository(context = context, database = database)
        assertTrue("Repository should have database attached", repo.isRoomDatabaseAttached())
        assertTrue("Offline cache should be active", repo.isOfflineCacheActive.value)

        // Give coroutines a brief tick to seed defaults if empty
        kotlinx.coroutines.delay(150)

        val sources = repo.sources.value
        assertTrue("Repository should have study sources loaded", sources.isNotEmpty())

        val flashcards = repo.flashcards.value
        assertTrue("Repository should have flashcards loaded", flashcards.isNotEmpty())

        // Test updating a flashcard box level in the repository
        val firstCard = flashcards.first()
        repo.updateFlashcardBox(firstCard.id, 4)
        kotlinx.coroutines.delay(100)

        val updatedCard = database.flashcardDao().getFlashcardById(firstCard.id)
        assertNotNull(updatedCard)
        assertEquals(4, updatedCard?.boxLevel)
    }

    @Test
    fun simulationScoreDao_canInsertAndQueryScoreHistory() = runBlocking {
        val testScore = SimulationScoreEntity.createHistoricalAttempt(
            id = "test_score_01",
            examId = "cissp",
            timestampMillis = System.currentTimeMillis() - 86400000,
            overallScore = 74,
            isPassed = true,
            timeSpentSeconds = 2400,
            totalQuestions = 50,
            attemptNumber = 1,
            domainScores = listOf(
                DomainScoreRecord("d1", "Security & Risk Management", 80),
                DomainScoreRecord("d2", "Asset Security", 70),
                DomainScoreRecord("d3", "Security Architecture", 65)
            )
        )

        database.simulationScoreDao().insertScore(testScore)

        val retrieved = database.simulationScoreDao().getScoreById("test_score_01")
        assertNotNull(retrieved)
        assertEquals(74, retrieved?.overallScorePercent)
        assertTrue(retrieved?.isPassed == true)
        assertEquals(1, retrieved?.attemptNumber)

        val domainList = retrieved?.parseDomainScores()
        assertNotNull(domainList)
        assertEquals(3, domainList?.size)
        assertEquals("Security & Risk Management", domainList?.first()?.domainName)
        assertEquals(80, domainList?.first()?.scorePercent)

        val examScores = database.simulationScoreDao().getScoresByExam("cissp").first()
        assertEquals(1, examScores.size)
    }

    @Test
    fun examRepository_handlesSubscriptionAndProfileSync() = runBlocking {
        val repo = ExamRepository(context = context, database = database)
        val initialProfile = repo.userProfile.value
        assertNotNull(initialProfile)
        assertEquals("GN Mohareb", initialProfile.displayName)

        // Subscribe to CompTIA Security+
        repo.subscribeToSubject("sec_plus")
        val updatedProfile = repo.userProfile.value
        val secPlusSub = updatedProfile.subscriptions.firstOrNull { it.examId == "sec_plus" }
        assertNotNull(secPlusSub)
        assertEquals(SubStatus.ACTIVE, secPlusSub?.status)

        // Cloud sync
        val syncResult = repo.syncCentralProfileWithCloud()
        assertTrue(syncResult)
    }
}
