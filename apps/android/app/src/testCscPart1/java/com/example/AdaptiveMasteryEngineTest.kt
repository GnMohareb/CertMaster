package com.example

import android.app.Application
import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.EmbeddedExamBank
import com.example.data.local.CertDatabase
import com.example.domain.AdaptivePracticeEngine
import com.example.model.AdaptiveConfig
import com.example.model.EmbeddedBankMetadata
import com.example.model.EvidenceConfidence
import com.example.model.ExamMode
import com.example.model.Question
import com.example.model.QuestionDifficulty
import com.example.model.QuestionPool
import com.example.model.SourceCitation
import com.example.ui.ExamViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class AdaptiveMasteryEngineTest {

    private lateinit var application: Application
    private lateinit var context: Context

    @Before
    fun setup() = runBlocking(Dispatchers.IO) {
        application = ApplicationProvider.getApplicationContext()
        context = application
        CertDatabase.getInstance(context).clearAllTables()
    }

    @After
    fun tearDown() = runBlocking(Dispatchers.IO) {
        CertDatabase.getInstance(context).clearAllTables()
    }

    private suspend fun awaitCondition(timeoutMs: Long = 4000L, predicate: suspend () -> Boolean) {
        val deadline = System.currentTimeMillis() + timeoutMs
        while (!predicate() && System.currentTimeMillis() < deadline) {
            delay(25)
        }
        assertTrue("Timed out waiting for asynchronous state update", predicate())
    }

    private fun q(
        id: String,
        domainId: String,
        domainName: String,
        topicId: String = "",
        topicName: String = "",
        objective: String = "",
        pool: QuestionPool = QuestionPool.GENERAL,
        dupGroup: String = "",
        difficulty: QuestionDifficulty = QuestionDifficulty.MEDIUM,
        difficultyExplicit: Boolean = true,
        optionAnalysis: Map<Int, String> = mapOf(
            0 to "Choice A analysis for $id",
            1 to "Choice B analysis for $id",
            2 to "Choice C analysis for $id",
            3 to "Choice D analysis for $id"
        )
    ): Question = Question(
        id = id,
        examId = "csc-part-1",
        domainId = domainId,
        domainName = domainName,
        questionText = "Synthetic CSC item $id covering $topicName ($domainName).",
        options = listOf("Option A", "Option B", "Option C", "Option D"),
        correctIndex = 0,
        explanation = "Synthetic rationale for $id.",
        optionAnalysis = optionAnalysis,
        citation = SourceCitation("CSC Vol 1", "Ch. 1", "CSC Part 1"),
        difficulty = difficulty,
        topicId = topicId,
        topicName = topicName,
        learningObjective = objective,
        questionPool = pool,
        nearDuplicateGroupId = dupGroup,
        difficultyExplicit = difficultyExplicit
    )

    private fun buildRichSyntheticBank(): List<Question> = listOf(
        q("d1_t1_a", "csc-d1", "Canadian Capital Markets", "t_reg", "Regulation & CIRO", "Explain CIRO role", dupGroup = "dup_reg_1"),
        q("d1_t1_b", "csc-d1", "Canadian Capital Markets", "t_reg", "Regulation & CIRO", "Explain CIRO role", dupGroup = "dup_reg_2"),
        q("d1_t1_dup", "csc-d1", "Canadian Capital Markets", "t_reg", "Regulation & CIRO", "Explain CIRO role", dupGroup = "dup_reg_1"),
        q("d1_t2_a", "csc-d1", "Canadian Capital Markets", "t_macro", "Macroeconomics", "Interpret Bank Rate"),
        q("d2_t1_a", "csc-d2", "Fixed Income & Equities", "t_bonds", "Bond Pricing & Duration", "Relate yield to price", difficulty = QuestionDifficulty.EASY),
        q("d2_t1_b", "csc-d2", "Fixed Income & Equities", "t_bonds", "Bond Pricing & Duration", "Relate yield to price", difficulty = QuestionDifficulty.HARD),
        q("d2_t2_a", "csc-d2", "Fixed Income & Equities", "t_equity", "Common & Preferred Shares", "Compare share classes"),
        q("d3_unmapped_a", "csc-d3", "Financial Analysis", "", "", ""),
        q("d3_reserved_exam", "csc-d3", "Financial Analysis", "t_ratios", "Financial Ratios", "Compute current ratio", pool = QuestionPool.FULL_EXAM_RESERVED)
    )

    @Test
    fun initialAssessment_samplesWithoutDuplicates_excludesReservedExamQuestions_andAppliesWeightsWhenVerified() {
        val bank = buildRichSyntheticBank()

        // Balanced (no syllabus weights)
        val balanced = AdaptivePracticeEngine.selectInitialAssessmentQuestions(
            allQuestions = bank,
            syllabusWeights = emptyMap(),
            targetLength = 6
        )
        assertEquals(6, balanced.size)
        assertEquals(6, balanced.map { it.id }.distinct().size)
        assertFalse("FULL_EXAM_RESERVED must be excluded from initial assessment", balanced.any { it.id == "d3_reserved_exam" })
        // Covers all 3 domains present in non-reserved pool
        assertEquals(3, balanced.map { it.domainId }.distinct().size)

        // Weighted (75% d2, 25% d1)
        val weighted = AdaptivePracticeEngine.selectInitialAssessmentQuestions(
            allQuestions = bank,
            syllabusWeights = mapOf("csc-d2" to 75, "csc-d1" to 25),
            targetLength = 4
        )
        assertEquals(4, weighted.size)
        assertTrue(weighted.count { it.domainId == "csc-d2" } >= 2)
    }

    @Test
    fun unassessedTopicsAndDomains_areNeverLabeledWeak_andReportedHonestly() {
        val bank = buildRichSyntheticBank()
        val allTopics = AdaptivePracticeEngine.buildAllTopicStates(
            examId = "csc-part-1",
            questions = bank,
            storedStates = emptyList()
        )
        assertTrue(allTopics.all { !it.isAssessed })
        assertTrue(allTopics.all { it.confidence == EvidenceConfidence.UNASSESSED })
        assertEquals("Not assessed", EvidenceConfidence.UNASSESSED.displayLabel())

        // Missing topic mapping is explicitly marked unmapped rather than invented
        val unmapped = allTopics.first { it.domainId == "csc-d3" && !it.hasExplicitTopicMapping }
        assertTrue(unmapped.topicKey.startsWith("unmapped:"))

        val domainSummaries = AdaptivePracticeEngine.aggregateDomainMastery(
            questions = bank,
            topicStates = allTopics,
            nowMillis = 1_000_000L
        )
        assertTrue("Unassessed domains must never be flagged weak", domainSummaries.none { it.isWeak })

        val recs = AdaptivePracticeEngine.buildRecommendations(
            topicStates = allTopics,
            domainSummaries = domainSummaries,
            questions = bank,
            hasCompletedBaseline = false,
            nowMillis = 1_000_000L
        )
        assertEquals(ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT, recs.first().mode)
        assertFalse(recs.any { it.id == "rec_weak_topics" })
    }

    @Test
    fun masteryScoring_respectsRepeatDiscount_insufficientEvidenceCap_andIgnoresSkipsAndViews() {
        val config = AdaptiveConfig()
        val item1 = q("q_m1", "csc-d1", "Capital Markets", "t_reg", "Regulation")
        val item2 = q("q_m2", "csc-d1", "Capital Markets", "t_reg", "Regulation")
        val item3 = q("q_m3", "csc-d1", "Capital Markets", "t_reg", "Regulation")

        // Skipped and explanation-only never mutate mastery
        val skipped = AdaptivePracticeEngine.applyAnswerToMastery(
            existingTopic = null,
            existingExposure = null,
            question = item1,
            isCorrect = false,
            wasSkipped = true,
            nowMillis = 1000L,
            globalOrder = 1L,
            config = config
        )
        assertFalse(skipped.applied)
        assertEquals(0, skipped.topicState.attemptCount)

        val viewOnly = AdaptivePracticeEngine.applyAnswerToMastery(
            existingTopic = null,
            existingExposure = null,
            question = item1,
            isCorrect = true,
            viewedExplanationOnly = true,
            nowMillis = 1000L,
            globalOrder = 1L,
            config = config
        )
        assertFalse(viewOnly.applied)
        assertEquals(0, viewOnly.topicState.attemptCount)

        // Repeating the exact same single question 6 times cannot exceed maxUnestablishedMasteryPercent (74)
        var topicState = null as com.example.model.TopicMasteryState?
        var exposureState = null as com.example.model.QuestionExposureState?
        repeat(6) { idx ->
            val res = AdaptivePracticeEngine.applyAnswerToMastery(
                existingTopic = topicState,
                existingExposure = exposureState,
                question = item1,
                isCorrect = true,
                nowMillis = 10_000L + idx * 1000L,
                globalOrder = (idx + 1).toLong(),
                config = config
            )
            assertTrue(res.applied)
            topicState = res.topicState
            exposureState = res.exposureState
        }
        assertEquals(EvidenceConfidence.INSUFFICIENT_EVIDENCE, topicState!!.confidence)
        assertTrue(
            "Repeating 1 item must remain capped below mastered threshold",
            topicState!!.masteryPercent <= config.maxUnestablishedMasteryPercent
        )

        // Wrong answer lowers mastery; multiple distinct items allow climbing beyond cap
        val afterMiss = AdaptivePracticeEngine.applyAnswerToMastery(
            existingTopic = topicState,
            existingExposure = null,
            question = item2,
            isCorrect = false,
            nowMillis = 20_000L,
            globalOrder = 7L,
            config = config
        ).topicState
        assertTrue("Wrong answer must decrease mastery", afterMiss.masteryPercent < topicState!!.masteryPercent)

        val afterCorrect2 = AdaptivePracticeEngine.applyAnswerToMastery(
            existingTopic = afterMiss,
            existingExposure = null,
            question = item2,
            isCorrect = true,
            nowMillis = 25_000L,
            globalOrder = 8L,
            config = config
        ).topicState
        val afterCorrect3 = AdaptivePracticeEngine.applyAnswerToMastery(
            existingTopic = afterCorrect2,
            existingExposure = null,
            question = item3,
            isCorrect = true,
            nowMillis = 30_000L,
            globalOrder = 9L,
            config = config
        ).topicState
        assertTrue(afterCorrect3.masteryPercent > afterMiss.masteryPercent)
        assertNotEquals(EvidenceConfidence.INSUFFICIENT_EVIDENCE, afterCorrect3.confidence)
    }

    @Test
    fun adaptivePracticeSelection_prioritizesWeakInsufficientAndReviewDue_andAvoidsNearDuplicates() {
        val bank = buildRichSyntheticBank()
        val now = 1_000_000_000L

        val weakState = AdaptivePracticeEngine.buildAllTopicStates("csc-part-1", bank, emptyList())
            .first { it.topicKey == "t_reg" }
            .copy(
                masteryPercent = 35,
                attemptCount = 4,
                correctCount = 1,
                uniqueQuestionIds = setOf("d1_t1_a", "d1_t1_b"),
                confidence = EvidenceConfidence.EMERGING,
                nextReviewDueAtMillis = now - 60_000L
            )
        val strongDueState = AdaptivePracticeEngine.buildAllTopicStates("csc-part-1", bank, emptyList())
            .first { it.topicKey == "t_bonds" }
            .copy(
                masteryPercent = 85,
                attemptCount = 5,
                correctCount = 5,
                uniqueQuestionIds = setOf("d2_t1_a", "d2_t1_b", "d2_t1_c"),
                confidence = EvidenceConfidence.ESTABLISHED,
                nextReviewDueAtMillis = now - 120_000L
            )

        val selection = AdaptivePracticeEngine.selectAdaptivePracticeQuestions(
            allQuestions = bank,
            mode = ExamMode.AI_ADAPTIVE_DRILL,
            topicStates = mapOf(
                weakState.topicKey to weakState,
                strongDueState.topicKey to strongDueState
            ),
            exposures = emptyMap(),
            nowMillis = now,
            currentGlobalStep = 5L,
            requestedCount = 5
        )

        assertFalse("FULL_EXAM_RESERVED must never appear in adaptive practice", selection.questions.any { it.id == "d3_reserved_exam" })
        assertTrue(selection.questions.any { it.topicId == "t_reg" })
        // d1_t1_a and d1_t1_dup share nearDuplicateGroupId = dup_reg_1, should not both be picked before other topics
        val dupGroupCount = selection.questions.count { it.nearDuplicateGroupId == "dup_reg_1" }
        assertTrue("Near-duplicate group should appear at most once while diverse candidates exist", dupGroupCount <= 1)
    }

    @Test
    fun immediateCheckAnswer_insertsDifferentRemediationQuestion_andFullExamRemainsStrict() = runBlocking(Dispatchers.IO) {
        val bank = buildRichSyntheticBank()
        val vm = ExamViewModel(application)
        try {
            vm.repositoryForTesting().setQuestionsForTesting(bank)

            // 1. Full simulation keeps fixed order and checkPracticeAnswer does not reveal feedback
            vm.startSimulation(ExamMode.FULL_SIMULATION)
            val fullOrder = vm.simulationQuestions.value.map { it.id }
            assertTrue("Reserved exam question should be included in full exam", fullOrder.contains("d3_reserved_exam"))
            vm.selectOption(0, 1)
            vm.checkPracticeAnswer(0)
            assertNull("Full exam must not reveal immediate practice feedback", vm.currentPracticeFeedback.value)
            assertTrue(vm.checkedQuestionIndices.value.isEmpty())
            vm.abandonSimulation()

            // 2. Adaptive practice: wrong answer shows distractor feedback, inserts different topic question next, schedules delayed revisit
            vm.startAdaptivePractice(topicFilterKey = "t_reg", requestedCount = 1)
            assertEquals(ExamMode.AI_ADAPTIVE_DRILL, vm.activeMode.value)
            val firstQ = vm.simulationQuestions.value[0]
            assertEquals("t_reg", firstQ.topicId)
            val wrongOpt = (firstQ.correctIndex + 1) % firstQ.options.size
            vm.selectOption(0, wrongOpt)
            vm.checkPracticeAnswer(0)

            awaitCondition {
                vm.currentPracticeFeedback.value != null &&
                    vm.topicMasteryList.value.any { it.topicKey == "t_reg" && it.attemptCount == 1 }
            }
            val feedback = vm.currentPracticeFeedback.value!!
            assertFalse(feedback.isCorrect)
            assertEquals(firstQ.optionAnalysis[wrongOpt], feedback.selectedOptionAnalysis)
            assertNotNull("Expected a DIFFERENT remediation question to be inserted next", feedback.remediationQuestionId)
            assertNotEquals(firstQ.id, feedback.remediationQuestionId)
            assertEquals(2, vm.simulationQuestions.value.size)
            assertEquals(feedback.remediationQuestionId, vm.simulationQuestions.value[1].id)
            assertTrue(vm.remediationQueue.value.any { it.questionId == firstQ.id })

            // Advance twice -> delayed revisit of missed firstQ should be queued cleanly
            vm.nextQuestion() // step 1, Q1
            vm.nextQuestion() // step 2 -> revisit due!
            assertTrue(
                "Delayed revisit of original missed question should be inserted after intervening step",
                vm.simulationQuestions.value.drop(1).any { it.id == firstQ.id }
            )
        } finally {
            vm.speechManager.shutdown()
        }
    }

    @Test
    fun initialAssessmentBaselinePreservedOnRetake_andIdempotentEvidenceSurvivesRestart() = runBlocking(Dispatchers.IO) {
        val bank = buildRichSyntheticBank()
        val meta = EmbeddedBankMetadata(schemaVersion = 2, examId = "csc-part-1", bankVersion = "2")

        // Launch 1: Complete first Initial Assessment -> becomes fixed baseline
        val vm1 = ExamViewModel(application)
        try {
            vm1.repositoryForTesting().setQuestionsForTesting(bank, meta)
            vm1.startSimulation(ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT, requestedCount = 4)
            vm1.simulationQuestions.value.forEachIndexed { idx, question ->
                // 50% baseline (2 right, 2 wrong)
                val choice = if (idx < 2) question.correctIndex else (question.correctIndex + 1) % question.options.size
                vm1.selectOption(idx, choice)
            }
            vm1.finishSimulation()
            awaitCondition { vm1.initialBaselineSession.value != null && vm1.sessions.value.size == 1 }
            assertEquals(50, vm1.initialBaselineSession.value!!.scorePercent)
            assertTrue(vm1.initialBaselineSession.value!!.isInitialBaseline)

            // Retake Initial Assessment scoring 100% -> historical record added, initial baseline stays 50%
            vm1.startSimulation(ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT, requestedCount = 4)
            vm1.simulationQuestions.value.forEachIndexed { idx, question ->
                vm1.selectOption(idx, question.correctIndex)
            }
            vm1.finishSimulation()
            awaitCondition { vm1.sessions.value.size == 2 }
            assertEquals(50, vm1.initialBaselineSession.value!!.scorePercent)

            // Start Adaptive Practice, check 1 answer, pause & save for restart
            vm1.startAdaptivePractice(requestedCount = 3)
            val pq0 = vm1.simulationQuestions.value[0]
            vm1.selectOption(0, pq0.correctIndex)
            vm1.checkPracticeAnswer(0)
            awaitCondition {
                CertDatabase.getInstance(context).adaptiveMasteryDao().getAnswerEventCount("csc-part-1") >= 9
            }
            val eventCountBeforeRestart = CertDatabase.getInstance(context).adaptiveMasteryDao().getAnswerEventCount("csc-part-1")
            vm1.pauseAndExitToDashboard()
            awaitCondition {
                CertDatabase.getInstance(context).activeExamAttemptDao().getAttemptForExam("csc-part-1")?.isPaused == true
            }

            // Simulate app restart (vm2) -> resume saved adaptive session & finish without double-applying checked item
            val vm2 = ExamViewModel(application)
            try {
                vm2.repositoryForTesting().setQuestionsForTesting(bank, meta)
                awaitCondition { vm2.savedActiveAttempt.value != null }
                assertTrue(vm2.resumeSavedSimulation())
                assertTrue(vm2.checkedQuestionIndices.value.contains(0))
                vm2.finishSimulation()

                awaitCondition {
                    CertDatabase.getInstance(context).activeExamAttemptDao().getAttemptForExam("csc-part-1") == null &&
                        vm2.sessions.value.size == 3
                }
                // Delay briefly for any background recordAnswerEvidence coroutine and confirm eventCount did NOT duplicate checked pq0
                delay(150)
                val eventCountAfterResumeFinish = CertDatabase.getInstance(context).adaptiveMasteryDao().getAnswerEventCount("csc-part-1")
                assertEquals(
                    "Resuming and finishing must never double-record the already-checked question",
                    eventCountBeforeRestart,
                    eventCountAfterResumeFinish
                )
            } finally {
                vm2.speechManager.shutdown()
            }
        } finally {
            vm1.speechManager.shutdown()
        }
    }

    @Test
    fun bankAudit_andSchemaV2Parsing_reportMissingMetadataHonestly() {
        val jsonV2 = """
            {
              "schemaVersion": 2,
              "examId": "csc-part-1",
              "bankVersion": "2026.1",
              "syllabusEdition": "2026-placeholder-unverified",
              "syllabusWeights": { "csc-d1": 60, "csc-d2": 40 },
              "questions": [
                {
                  "id": "v2_q1",
                  "domainId": "csc-d1",
                  "domainName": "Capital Markets",
                  "topicId": "t_ciro",
                  "topicName": "CIRO Regulation",
                  "objectiveId": "obj_ciro_1",
                  "learningObjective": "Describe CIRO enforcement",
                  "questionType": "SCENARIO_MCQ",
                  "questionPool": "PRACTICE",
                  "nearDuplicateGroupId": "grp_1",
                  "difficulty": "HARD",
                  "questionText": "Question 1?",
                  "options": ["A1", "B1", "C1", "D1"],
                  "correctIndex": 2,
                  "explanation": "C1 is correct.",
                  "optionAnalysis": {
                    "A": "Why A is wrong",
                    "C": "Why C is right"
                  },
                  "citation": {"title": "CSC Vol 1", "sectionOrPage": "Ch 2", "standardOrFramework": "CSC"}
                },
                {
                  "id": "v2_q2",
                  "domainId": "csc-d2",
                  "domainName": "Products",
                  "questionPool": "FULL_EXAM_RESERVED",
                  "questionText": "Reserved exam question?",
                  "options": ["Opt1", "Opt2"],
                  "correctIndex": 0,
                  "explanation": "Opt1 is correct.",
                  "citation": {"title": "CSC Vol 1", "sectionOrPage": "Ch 5", "standardOrFramework": "CSC"}
                }
              ]
            }
        """.trimIndent()

        val result = EmbeddedExamBank.parseWithMetadata(jsonV2, "csc-part-1")
        assertEquals(2, result.metadata.schemaVersion)
        assertEquals("2026.1", result.metadata.bankVersion)
        assertEquals("2026-placeholder-unverified", result.metadata.syllabusEdition)
        assertEquals(mapOf("csc-d1" to 60, "csc-d2" to 40), result.metadata.syllabusWeights)
        assertEquals(2, result.questions.size)

        val q1 = result.questions[0]
        assertEquals("t_ciro", q1.topicId)
        assertEquals("obj_ciro_1", q1.objectiveId)
        assertEquals("SCENARIO_MCQ", q1.questionType)
        assertEquals(QuestionPool.PRACTICE, q1.questionPool)
        assertTrue(q1.difficultyExplicit)
        assertEquals("Why A is wrong", q1.optionAnalysis[0])
        assertEquals("Why C is right", q1.optionAnalysis[2])

        val q2 = result.questions[1]
        assertEquals("MULTIPLE_CHOICE", q2.questionType)
        assertEquals(QuestionPool.FULL_EXAM_RESERVED, q2.questionPool)
        assertFalse(q2.difficultyExplicit)

        val audit = EmbeddedExamBank.auditBank(result.questions, result.metadata)
        assertEquals(2, audit.totalQuestions)
        assertEquals(1, audit.practiceEligibleCount)
        assertEquals(1, audit.reservedFullExamCount)
        assertEquals(1, audit.unmappedTopicQuestionCount)
        assertEquals(1, audit.missingObjectiveCount)
        assertEquals(1, audit.missingOptionAnalysisCount)
        assertTrue(audit.usesSyllabusWeights)

        // Fail-closed validation checks
        val wrongExamJson = jsonV2.replace("\"examId\": \"csc-part-1\"", "\"examId\": \"cissp\"")
        val examMismatchThrown = runCatching {
            EmbeddedExamBank.parseWithMetadata(wrongExamJson, "csc-part-1")
        }.exceptionOrNull()
        assertTrue(examMismatchThrown is IllegalArgumentException)

        val badTypeJson = jsonV2.replace("\"SCENARIO_MCQ\"", "\"OPEN_ENDED\"")
        val badTypeThrown = runCatching {
            EmbeddedExamBank.parseWithMetadata(badTypeJson, "csc-part-1")
        }.exceptionOrNull()
        assertTrue(badTypeThrown is IllegalArgumentException)
    }
}
