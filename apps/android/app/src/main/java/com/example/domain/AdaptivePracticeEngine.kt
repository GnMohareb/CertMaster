package com.example.domain

import com.example.model.AdaptiveConfig
import com.example.model.AdaptiveSelectionResult
import com.example.model.DomainMasterySummary
import com.example.model.EvidenceConfidence
import com.example.model.ExamMode
import com.example.model.PracticeRecommendation
import com.example.model.Question
import com.example.model.QuestionDifficulty
import com.example.model.QuestionExposureState
import com.example.model.QuestionPool
import com.example.model.TopicMasteryState
import com.example.model.TopicScoreRecord
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Deterministic, offline-only adaptive assessment, practice selection, and mastery scoring engine.
 *
 * Design notes:
 * - Never invents missing topic mappings: if a question lacks topicId/topicName, it maps to an explicit
 *   unmapped domain fallback key and marks hasExplicitTopicMapping = false.
 * - Never labels unassessed topics as weak.
 * - Mastery is an observed practice evidence score (0..100) with diminishing repeat weight and minimum
 *   evidence thresholds; it does not claim psychometric exam pass probability.
 */
object AdaptivePracticeEngine {

    data class TopicResolution(
        val topicKey: String,
        val topicName: String,
        val hasExplicitMapping: Boolean
    )

    data class MasteryUpdateResult(
        val topicState: TopicMasteryState,
        val exposureState: QuestionExposureState,
        val applied: Boolean
    )

    private val promptSeparators = Regex("[^\\p{L}\\p{N}]+")

    fun questionPromptKey(question: Question): String =
        question.questionText.lowercase().replace(promptSeparators, " ").trim()

    fun excludePreviouslySeenQuestions(
        questions: List<Question>,
        seenIds: Set<String>
    ): List<Question> {
        val seenQuestions = questions.filter { it.id in seenIds }
        val seenPrompts = seenQuestions.mapTo(mutableSetOf(), ::questionPromptKey)
        val seenGroups = seenQuestions.mapNotNullTo(mutableSetOf()) {
            it.nearDuplicateGroupId.trim().takeIf(String::isNotEmpty)
        }
        return questions.filterNot {
            it.id in seenIds || questionPromptKey(it) in seenPrompts || it.nearDuplicateGroupId.trim() in seenGroups
        }
    }

    fun resolveTopic(question: Question): TopicResolution {
        val rawId = question.topicId.trim()
        val rawName = question.topicName.trim()
        return when {
            rawId.isNotEmpty() -> TopicResolution(
                topicKey = rawId,
                topicName = rawName.ifEmpty { rawId },
                hasExplicitMapping = true
            )
            rawName.isNotEmpty() -> {
                val slug = rawName.lowercase().replace(Regex("[^a-z0-9]+"), "-").trim('-')
                TopicResolution(
                    topicKey = "topic:${slug.ifEmpty { question.domainId }}",
                    topicName = rawName,
                    hasExplicitMapping = true
                )
            }
            else -> TopicResolution(
                topicKey = "unmapped:${question.domainId}",
                topicName = "${question.domainName} (Topic Unmapped)",
                hasExplicitMapping = false
            )
        }
    }

    fun isAdaptivePracticeMode(mode: ExamMode): Boolean = when (mode) {
        ExamMode.AI_ADAPTIVE_DRILL,
        ExamMode.DOMAIN_PRACTICE,
        ExamMode.AI_STRESS_STUDY,
        ExamMode.RETENTION_REVIEW -> true
        ExamMode.FULL_SIMULATION,
        ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT,
        ExamMode.FLASHCARDS -> false
    }

    fun eligibleQuestionsForMode(
        allQuestions: List<Question>,
        mode: ExamMode,
        domainFilterId: String? = null,
        topicFilterKey: String? = null
    ): List<Question> {
        val poolFiltered = when (mode) {
            ExamMode.FULL_SIMULATION -> {
                val reserved = allQuestions.filter { it.questionPool == QuestionPool.FULL_EXAM_RESERVED }
                val others = allQuestions.filter { it.questionPool != QuestionPool.FULL_EXAM_RESERVED }
                if (reserved.isNotEmpty() && others.any {
                        it.questionPool == QuestionPool.PRACTICE || it.questionPool == QuestionPool.ASSESSMENT
                    }
                ) {
                    reserved
                } else {
                    reserved + others
                }
            }
            ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT -> {
                allQuestions.filter { it.questionPool != QuestionPool.FULL_EXAM_RESERVED }
            }
            else -> {
                val nonReserved = allQuestions.filter { it.questionPool != QuestionPool.FULL_EXAM_RESERVED }
                val preferred = nonReserved.filter {
                    it.questionPool == QuestionPool.PRACTICE || it.questionPool == QuestionPool.GENERAL
                }
                preferred.ifEmpty { nonReserved }
            }
        }

        val domainFiltered = if (domainFilterId.isNullOrBlank()) {
            poolFiltered
        } else {
            poolFiltered.filter { it.domainId == domainFilterId }
        }

        return if (topicFilterKey.isNullOrBlank()) {
            domainFiltered
        } else {
            domainFiltered.filter { resolveTopic(it).topicKey == topicFilterKey }
        }
    }

    /**
     * Selects duplicate-free questions for Initial Assessment, stratified by domain and topic.
     * Uses verified syllabusWeights when present; otherwise balances equally across available domains/topics.
     */
    fun selectInitialAssessmentQuestions(
        allQuestions: List<Question>,
        syllabusWeights: Map<String, Int> = emptyMap(),
        targetLength: Int = AdaptiveConfig().initialAssessmentDefaultLength,
        maxLimit: Int = 50
    ): List<Question> {
        val eligible = eligibleQuestionsForMode(allQuestions, ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT)
        if (eligible.isEmpty()) return emptyList()

        val desiredCount = min(maxLimit, min(targetLength.coerceAtLeast(1), eligible.size))
        val byDomain = eligible.groupBy { it.domainId }
        val domainOrder = byDomain.keys.sorted()

        // Interleave topics within each domain so selecting N from a domain covers distinct topics first.
        val domainQueues: MutableMap<String, ArrayDeque<Question>> = domainOrder.associateWith { dId ->
            val domainQuestions = byDomain[dId].orEmpty()
            val byTopic = domainQuestions.groupBy { resolveTopic(it).topicKey }
            val topicQueues = byTopic.keys.sorted().map { ArrayDeque(byTopic[it].orEmpty()) }
            val interleaved = ArrayDeque<Question>()
            while (topicQueues.any { it.isNotEmpty() }) {
                for (tq in topicQueues) {
                    if (tq.isNotEmpty()) {
                        interleaved.addLast(tq.removeFirst())
                    }
                }
            }
            interleaved
        }.toMutableMap()

        val hasVerifiedWeights = syllabusWeights.isNotEmpty() &&
            domainOrder.any { (syllabusWeights[it] ?: 0) > 0 }

        val selected = mutableListOf<Question>()
        val selectedIds = mutableSetOf<String>()

        if (hasVerifiedWeights) {
            val totalWeight = domainOrder.sumOf { (syllabusWeights[it] ?: 0).coerceAtLeast(0) }.coerceAtLeast(1)
            for (dId in domainOrder) {
                val w = (syllabusWeights[dId] ?: 0).coerceAtLeast(0)
                if (w == 0) continue
                val quota = ((desiredCount.toDouble() * w) / totalWeight.toDouble()).roundToInt()
                    .coerceAtLeast(if ((domainQueues[dId]?.isNotEmpty() == true) && desiredCount >= domainOrder.size) 1 else 0)
                val qQueue = domainQueues[dId] ?: continue
                var taken = 0
                while (taken < quota && qQueue.isNotEmpty() && selected.size < desiredCount) {
                    val candidate = qQueue.removeFirst()
                    if (selectedIds.add(candidate.id)) {
                        selected.add(candidate)
                        taken++
                    }
                }
            }
        }

        // Fill balanced (or remaining weighted) slots round-robin across domains
        while (selected.size < desiredCount && domainQueues.values.any { it.isNotEmpty() }) {
            for (dId in domainOrder) {
                if (selected.size >= desiredCount) break
                val qQueue = domainQueues[dId] ?: continue
                while (qQueue.isNotEmpty()) {
                    val candidate = qQueue.removeFirst()
                    if (selectedIds.add(candidate.id)) {
                        selected.add(candidate)
                        break
                    }
                }
            }
        }

        return selected
    }

    /**
     * Deterministically applies one answered question to topic mastery and question exposure state.
     * Skipped and explanation-only views never mutate mastery or accuracy.
     */
    fun applyAnswerToMastery(
        existingTopic: TopicMasteryState?,
        existingExposure: QuestionExposureState?,
        question: Question,
        isCorrect: Boolean,
        wasSkipped: Boolean = false,
        viewedExplanationOnly: Boolean = false,
        nowMillis: Long,
        globalOrder: Long,
        bankVersion: String = "1",
        config: AdaptiveConfig = AdaptiveConfig()
    ): MasteryUpdateResult {
        val topicMeta = resolveTopic(question)
        val baseTopic = existingTopic ?: TopicMasteryState(
            examId = question.examId,
            topicKey = topicMeta.topicKey,
            topicName = topicMeta.topicName,
            domainId = question.domainId,
            domainName = question.domainName,
            masteryPercent = config.priorMasteryPercent.roundToInt(),
            accuracyPercent = 0,
            attemptCount = 0,
            correctCount = 0,
            uniqueQuestionIds = emptySet(),
            baselineScorePercent = null,
            baselineAttemptCount = 0,
            confidence = EvidenceConfidence.UNASSESSED,
            lastDifficulty = question.difficulty,
            consecutiveCorrect = 0,
            consecutiveIncorrect = 0,
            lastReviewedAtMillis = 0L,
            nextReviewDueAtMillis = 0L,
            modelVersion = config.modelVersion,
            bankVersion = bankVersion,
            hasExplicitTopicMapping = topicMeta.hasExplicitMapping
        )

        val baseExposure = existingExposure ?: QuestionExposureState(
            examId = question.examId,
            questionId = question.id
        )

        if (wasSkipped || viewedExplanationOnly) {
            return MasteryUpdateResult(baseTopic, baseExposure, applied = false)
        }

        val priorMastery = if (baseTopic.attemptCount == 0) {
            config.priorMasteryPercent
        } else {
            baseTopic.masteryPercent.toDouble()
        }

        // Repeat exposure discount: same question repeated contributes decaying evidence
        val priorExposures = baseExposure.exposureCount.coerceAtLeast(0)
        val repeatWeight = 1.0 / (1.0 + priorExposures * config.repeatExposureDecayFactor)

        // Difficulty multiplier only when difficulty was explicitly labeled in bank
        val diffMult = if (question.difficultyExplicit) {
            when (question.difficulty) {
                QuestionDifficulty.EASY -> if (isCorrect) 0.85 else 1.15
                QuestionDifficulty.MEDIUM -> 1.0
                QuestionDifficulty.HARD -> if (isCorrect) 1.2 else 0.85
            }
        } else {
            1.0
        }

        val rawDelta = if (isCorrect) {
            config.correctMasteryStepBase * repeatWeight * diffMult
        } else {
            -(config.incorrectMasteryPenaltyBase * repeatWeight * diffMult)
        }

        val newAttempts = baseTopic.attemptCount + 1
        val newCorrect = baseTopic.correctCount + (if (isCorrect) 1 else 0)
        val newUniqueIds = baseTopic.uniqueQuestionIds + question.id
        val newAccuracy = ((newCorrect.toDouble() / newAttempts.toDouble()) * 100.0).roundToInt().coerceIn(0, 100)

        val confidence = computeConfidence(
            attemptCount = newAttempts,
            uniqueCount = newUniqueIds.size,
            config = config
        )

        var newMastery = (priorMastery + rawDelta).roundToInt().coerceIn(0, 100)
        // Guardrail: cannot claim "Mastered" / >=80% from insufficient evidence or repeating 1 item
        if (confidence == EvidenceConfidence.UNASSESSED || confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE) {
            newMastery = min(newMastery, config.maxUnestablishedMasteryPercent)
        }

        val nextReviewHours = when {
            !isCorrect -> config.lowMasteryReviewHours
            newMastery < config.weakThresholdPercent -> config.lowMasteryReviewHours
            newMastery < config.masteredThresholdPercent -> config.emergingMasteryReviewHours
            else -> config.establishedMasteryReviewHours
        }
        val nextReviewMillis = nowMillis + (nextReviewHours * 3_600_000L)

        val updatedTopic = baseTopic.copy(
            topicName = topicMeta.topicName,
            domainId = question.domainId,
            domainName = question.domainName,
            masteryPercent = newMastery,
            accuracyPercent = newAccuracy,
            attemptCount = newAttempts,
            correctCount = newCorrect,
            uniqueQuestionIds = newUniqueIds,
            confidence = confidence,
            lastDifficulty = question.difficulty,
            consecutiveCorrect = if (isCorrect) baseTopic.consecutiveCorrect + 1 else 0,
            consecutiveIncorrect = if (isCorrect) 0 else baseTopic.consecutiveIncorrect + 1,
            lastReviewedAtMillis = nowMillis,
            nextReviewDueAtMillis = nextReviewMillis,
            modelVersion = config.modelVersion,
            bankVersion = bankVersion,
            hasExplicitTopicMapping = topicMeta.hasExplicitMapping
        )

        val updatedExposure = baseExposure.copy(
            exposureCount = baseExposure.exposureCount + 1,
            correctCount = baseExposure.correctCount + (if (isCorrect) 1 else 0),
            incorrectCount = baseExposure.incorrectCount + (if (isCorrect) 0 else 1),
            lastCorrect = isCorrect,
            lastGlobalOrder = globalOrder,
            dueReviewAfterOrder = if (isCorrect) 0L else globalOrder + config.remediationInterveningQuestions,
            lastAnsweredAtMillis = nowMillis,
            nextReviewDueAtMillis = nextReviewMillis
        )

        return MasteryUpdateResult(
            topicState = updatedTopic,
            exposureState = updatedExposure,
            applied = true
        )
    }

    fun computeConfidence(
        attemptCount: Int,
        uniqueCount: Int,
        config: AdaptiveConfig = AdaptiveConfig()
    ): EvidenceConfidence = when {
        attemptCount <= 0 -> EvidenceConfidence.UNASSESSED
        attemptCount < config.minQuestionsForConfidence || uniqueCount < config.minUniqueQuestionsForEstablished ->
            EvidenceConfidence.INSUFFICIENT_EVIDENCE
        attemptCount < 5 || uniqueCount < 3 ->
            EvidenceConfidence.EMERGING
        else ->
            EvidenceConfidence.ESTABLISHED
    }

    /**
     * Merges stored TopicMasteryStates with all topics present in the installed bank so unassessed
     * topics remain visible as "Not assessed" without fabricating weakness.
     */
    fun buildAllTopicStates(
        examId: String,
        questions: List<Question>,
        storedStates: List<TopicMasteryState>,
        config: AdaptiveConfig = AdaptiveConfig(),
        bankVersion: String = "1"
    ): List<TopicMasteryState> {
        val byKey = storedStates.associateBy { it.topicKey }.toMutableMap()
        questions.forEach { q ->
            val meta = resolveTopic(q)
            if (!byKey.containsKey(meta.topicKey)) {
                byKey[meta.topicKey] = TopicMasteryState(
                    examId = examId,
                    topicKey = meta.topicKey,
                    topicName = meta.topicName,
                    domainId = q.domainId,
                    domainName = q.domainName,
                    masteryPercent = 0,
                    accuracyPercent = 0,
                    attemptCount = 0,
                    correctCount = 0,
                    uniqueQuestionIds = emptySet(),
                    baselineScorePercent = null,
                    baselineAttemptCount = 0,
                    confidence = EvidenceConfidence.UNASSESSED,
                    lastDifficulty = q.difficulty,
                    modelVersion = config.modelVersion,
                    bankVersion = bankVersion,
                    hasExplicitTopicMapping = meta.hasExplicitMapping
                )
            }
        }
        return byKey.values.sortedWith(
            compareBy<TopicMasteryState> { !it.isAssessed }
                .thenBy { it.masteryPercent }
                .thenBy { it.topicName }
        )
    }

    fun aggregateDomainMastery(
        questions: List<Question>,
        topicStates: List<TopicMasteryState>,
        nowMillis: Long,
        config: AdaptiveConfig = AdaptiveConfig()
    ): List<DomainMasterySummary> {
        val topicsByDomain = topicStates.groupBy { it.domainId }
        val questionDomains = questions.groupBy { it.domainId }
        val allDomainIds = (topicsByDomain.keys + questionDomains.keys).distinct()

        return allDomainIds.map { dId ->
            val domainTopics = topicsByDomain[dId].orEmpty()
            val domainName = domainTopics.firstOrNull()?.domainName
                ?: questionDomains[dId]?.firstOrNull()?.domainName
                ?: dId
            val assessedTopics = domainTopics.filter { it.isAssessed }
            val totalAttempts = assessedTopics.sumOf { it.attemptCount }
            val totalCorrect = assessedTopics.sumOf { it.correctCount }
            val uniqueCount = assessedTopics.flatMap { it.uniqueQuestionIds }.distinct().size
            val masteryAvg = if (assessedTopics.isNotEmpty()) {
                val weightedSum = assessedTopics.sumOf { it.masteryPercent * it.attemptCount.coerceAtLeast(1) }
                val totalW = assessedTopics.sumOf { it.attemptCount.coerceAtLeast(1) }.coerceAtLeast(1)
                (weightedSum.toDouble() / totalW.toDouble()).roundToInt().coerceIn(0, 100)
            } else {
                0
            }
            val accuracyPct = if (totalAttempts > 0) {
                ((totalCorrect.toDouble() / totalAttempts.toDouble()) * 100.0).roundToInt().coerceIn(0, 100)
            } else {
                0
            }
            val baselineTopics = domainTopics.filter { it.baselineScorePercent != null }
            val baselinePct = if (baselineTopics.isNotEmpty()) {
                val bWeighted = baselineTopics.sumOf { (it.baselineScorePercent ?: 0) * it.baselineAttemptCount.coerceAtLeast(1) }
                val bTotal = baselineTopics.sumOf { it.baselineAttemptCount.coerceAtLeast(1) }.coerceAtLeast(1)
                (bWeighted.toDouble() / bTotal.toDouble()).roundToInt()
            } else {
                null
            }
            val confidence = computeConfidence(totalAttempts, uniqueCount, config)
            val dueCount = assessedTopics.count { it.nextReviewDueAtMillis in 1L..nowMillis }
            val isWeak = assessedTopics.isNotEmpty() && masteryAvg < config.weakThresholdPercent

            DomainMasterySummary(
                domainId = dId,
                domainName = domainName,
                masteryPercent = masteryAvg,
                accuracyPercent = accuracyPct,
                attemptCount = totalAttempts,
                correctCount = totalCorrect,
                uniqueQuestionCount = uniqueCount,
                confidence = confidence,
                baselineScorePercent = baselinePct,
                totalTopicsInBank = domainTopics.size.coerceAtLeast(
                    questionDomains[dId]?.map { resolveTopic(it).topicKey }?.distinct()?.size ?: 0
                ),
                assessedTopicsCount = assessedTopics.size,
                isWeak = isWeak,
                dueForReviewCount = dueCount
            )
        }.sortedWith(
            compareBy<DomainMasterySummary> { !it.isAssessed }
                .thenBy { it.masteryPercent }
                .thenBy { it.domainName }
        )
    }

    /**
     * Builds an adaptive practice queue according to configurable proportions:
     * weak topics (45%), insufficient-evidence topics (25%), retention review due (20%),
     * and stronger maintenance topics (10%), avoiding immediate repeats & near-duplicates.
     */
    fun selectAdaptivePracticeQuestions(
        allQuestions: List<Question>,
        mode: ExamMode,
        topicStates: Map<String, TopicMasteryState>,
        exposures: Map<String, QuestionExposureState>,
        nowMillis: Long,
        currentGlobalStep: Long,
        domainFilterId: String? = null,
        topicFilterKey: String? = null,
        requestedCount: Int? = null,
        excludeQuestionIds: Set<String> = emptySet(),
        config: AdaptiveConfig = AdaptiveConfig(),
        freshOnly: Boolean = false
    ): AdaptiveSelectionResult {
        val eligible = eligibleQuestionsForMode(allQuestions, mode, domainFilterId, topicFilterKey)
        if (eligible.isEmpty()) {
            return AdaptiveSelectionResult(
                questions = emptyList(),
                selectionReasons = emptyMap(),
                isBankExhausted = true,
                exhaustionNotice = "No eligible practice questions exist for this selection."
            )
        }

        val targetCount = min(
            requestedCount ?: config.defaultPracticeSessionLength,
            eligible.size
        ).coerceAtLeast(1)

        val freshPool = if (freshOnly) {
            val seenIds = excludeQuestionIds + exposures.filterValues { it.exposureCount > 0 }.keys
            val freshIds = excludePreviouslySeenQuestions(allQuestions, seenIds).mapTo(mutableSetOf()) { it.id }
            eligible.filter { it.id in freshIds }
        } else {
            eligible.filterNot { it.id in excludeQuestionIds }
        }
        val candidatePool = if (freshOnly || freshPool.isNotEmpty()) freshPool else eligible
        val isBankExhausted = freshPool.isEmpty() && (freshOnly || excludeQuestionIds.isNotEmpty())

        fun targetDifficultyFor(topicKey: String): QuestionDifficulty {
            val state = topicStates[topicKey]
            val mastery = state?.masteryPercent ?: 50
            return when {
                state == null || !state.isAssessed -> QuestionDifficulty.MEDIUM
                mastery < 45 -> QuestionDifficulty.EASY
                mastery < 75 -> QuestionDifficulty.MEDIUM
                else -> QuestionDifficulty.HARD
            }
        }

        fun rankCandidates(list: List<Question>): List<Question> {
            return list.sortedWith(
                compareBy<Question>(
                    { exposures[it.id]?.exposureCount ?: 0 },
                    {
                        val exp = exposures[it.id]
                        if (exp != null && !exp.lastCorrect && exp.dueReviewAfterOrder > 0 && currentGlobalStep >= exp.dueReviewAfterOrder) 0 else 1
                    },
                    {
                        if (!it.difficultyExplicit) 0 else {
                            val target = targetDifficultyFor(resolveTopic(it).topicKey)
                            if (it.difficulty == target) 0 else 1
                        }
                    },
                    { exposures[it.id]?.lastAnsweredAtMillis ?: 0L },
                    { it.id }
                )
            )
        }

        val weakCandidates = mutableListOf<Question>()
        val insufficientCandidates = mutableListOf<Question>()
        val reviewDueCandidates = mutableListOf<Question>()
        val strongCandidates = mutableListOf<Question>()

        for (q in rankCandidates(candidatePool)) {
            val tKey = resolveTopic(q).topicKey
            val state = topicStates[tKey]
            val exp = exposures[q.id]
            val isExposureDue = exp != null && (
                (exp.nextReviewDueAtMillis in 1L..nowMillis) ||
                    (exp.dueReviewAfterOrder in 1L..currentGlobalStep)
                )
            val isTopicDue = state != null && state.isAssessed && state.nextReviewDueAtMillis in 1L..nowMillis

            when {
                mode == ExamMode.RETENTION_REVIEW && (isExposureDue || isTopicDue) -> reviewDueCandidates.add(q)
                state != null && state.isAssessed && state.masteryPercent < config.weakThresholdPercent -> weakCandidates.add(q)
                state == null || !state.isAssessed || state.confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE ->
                    insufficientCandidates.add(q)
                isExposureDue || isTopicDue -> reviewDueCandidates.add(q)
                else -> strongCandidates.add(q)
            }
        }

        val picked = mutableListOf<Question>()
        val pickedIds = mutableSetOf<String>()
        val usedDuplicateGroups = mutableSetOf<String>()
        val usedPrompts = mutableSetOf<String>()
        val reasons = linkedMapOf<String, String>()

        fun tryAdd(q: Question, reason: String, allowDuplicateGroup: Boolean): Boolean {
            if (!pickedIds.add(q.id)) return false
            val prompt = if (freshOnly) questionPromptKey(q) else null
            val dupGroup = q.nearDuplicateGroupId.trim()
            if (prompt != null && prompt in usedPrompts) {
                pickedIds.remove(q.id)
                return false
            }
            if (!allowDuplicateGroup && dupGroup.isNotEmpty() && !usedDuplicateGroups.add(dupGroup)) {
                pickedIds.remove(q.id)
                return false
            }
            if (dupGroup.isNotEmpty()) usedDuplicateGroups.add(dupGroup)
            if (prompt != null) usedPrompts.add(prompt)
            picked.add(q)
            reasons[q.id] = reason
            return true
        }

        fun takeFromBucket(bucket: MutableList<Question>, limit: Int, reasonProvider: (Question) -> String, allowDup: Boolean) {
            var taken = 0
            val iter = bucket.iterator()
            while (iter.hasNext() && taken < limit && picked.size < targetCount) {
                val q = iter.next()
                if (tryAdd(q, reasonProvider(q), allowDup)) {
                    iter.remove()
                    taken++
                }
            }
        }

        if (mode == ExamMode.RETENTION_REVIEW) {
            takeFromBucket(reviewDueCandidates, targetCount, { q ->
                "Due for retention review (${resolveTopic(q).topicName})"
            }, allowDup = false)
            takeFromBucket(weakCandidates, targetCount - picked.size, { q ->
                val m = topicStates[resolveTopic(q).topicKey]?.masteryPercent ?: 0
                "Weak topic reinforcement ($m% mastery)"
            }, allowDup = false)
            takeFromBucket(insufficientCandidates, targetCount - picked.size, { q ->
                "Needs more evidence (${resolveTopic(q).topicName})"
            }, allowDup = false)
        } else {
            val weakQuota = max(1, (targetCount * config.weakTopicWeightPercent) / 100)
            val insufQuota = max(1, (targetCount * config.insufficientEvidenceWeightPercent) / 100)
            val reviewQuota = max(1, (targetCount * config.retentionReviewWeightPercent) / 100)
            val strongQuota = (targetCount * config.maintenanceStrongWeightPercent) / 100

            takeFromBucket(weakCandidates, weakQuota, { q ->
                val state = topicStates[resolveTopic(q).topicKey]
                "Weak topic focus: ${resolveTopic(q).topicName} (${state?.masteryPercent ?: 0}% mastery)"
            }, allowDup = false)

            takeFromBucket(insufficientCandidates, insufQuota, { q ->
                val state = topicStates[resolveTopic(q).topicKey]
                if (state == null || !state.isAssessed) {
                    "Not yet assessed: ${resolveTopic(q).topicName}"
                } else {
                    "Insufficient evidence (${state.attemptCount} answered): ${resolveTopic(q).topicName}"
                }
            }, allowDup = false)

            takeFromBucket(reviewDueCandidates, reviewQuota, { q ->
                "Retention review due: ${resolveTopic(q).topicName}"
            }, allowDup = false)

            if (strongQuota > 0) {
                takeFromBucket(strongCandidates, strongQuota, { q ->
                    "Maintenance check: ${resolveTopic(q).topicName}"
                }, allowDup = false)
            }
        }

        // Fill remaining slots smoothly from weak -> insufficient -> review -> strong (first non-duplicate-group, then fallback)
        val refillOrder = listOf(
            weakCandidates to { q: Question -> "Weak topic focus: ${resolveTopic(q).topicName}" },
            insufficientCandidates to { q: Question -> "Expanding evidence: ${resolveTopic(q).topicName}" },
            reviewDueCandidates to { q: Question -> "Retention review: ${resolveTopic(q).topicName}" },
            strongCandidates to { q: Question -> "Maintenance check: ${resolveTopic(q).topicName}" }
        )

        for (allowDup in if (freshOnly) listOf(false) else listOf(false, true)) {
            if (picked.size >= targetCount) break
            for ((bucket, reasonFn) in refillOrder) {
                if (picked.size >= targetCount) break
                takeFromBucket(bucket, targetCount - picked.size, reasonFn, allowDup)
            }
        }

        val exhaustionNotice = when {
            freshOnly && picked.isEmpty() -> "You’ve seen all available questions for this selection. Choose a different topic or open Retention Review."
            freshOnly && picked.size < (requestedCount ?: config.defaultPracticeSessionLength) ->
                "This session includes ${picked.size} remaining new questions for this selection."
            isBankExhausted -> "All eligible fresh questions for this selection have been used. Reviewing previously seen items."
            picked.size < (requestedCount ?: config.defaultPracticeSessionLength) ->
                "Showing all ${picked.size} eligible question(s) currently installed for this selection."
            else -> null
        }

        return AdaptiveSelectionResult(
            questions = picked,
            selectionReasons = reasons,
            isBankExhausted = isBankExhausted,
            exhaustionNotice = exhaustionNotice
        )
    }

    /**
     * Picks a different question on the same topic, falling back to the same domain,
     * and skips known near-duplicates after an incorrect answer during adaptive practice.
     */
    fun pickImmediateRemediationQuestion(
        missedQuestion: Question,
        allQuestions: List<Question>,
        excludeQuestionIds: Set<String>,
        exposures: Map<String, QuestionExposureState>
    ): Question? {
        val eligible = eligibleQuestionsForMode(allQuestions, ExamMode.AI_ADAPTIVE_DRILL)
            .filter { it.id != missedQuestion.id && it.id !in excludeQuestionIds }
        if (eligible.isEmpty()) return null

        val missedTopicKey = resolveTopic(missedQuestion).topicKey
        val missedDupGroup = missedQuestion.nearDuplicateGroupId.trim()
        val relatedQuestions = eligible.filter { candidate ->
            (resolveTopic(candidate).topicKey == missedTopicKey || candidate.domainId == missedQuestion.domainId) &&
                (missedDupGroup.isEmpty() || candidate.nearDuplicateGroupId.trim() != missedDupGroup)
        }
        return relatedQuestions.sortedWith(
            compareBy<Question>(
                { resolveTopic(it).topicKey != missedTopicKey },
                { exposures[it.id]?.exposureCount ?: 0 },
                {
                    if (!it.difficultyExplicit) 0 else when (it.difficulty) {
                        QuestionDifficulty.EASY -> 0
                        QuestionDifficulty.MEDIUM -> 1
                        QuestionDifficulty.HARD -> 2
                    }
                },
                { it.id }
            )
        ).firstOrNull()
    }

    fun buildTopicScoresFromSession(
        questions: List<Question>,
        userAnswers: Map<Int, Int>,
        config: AdaptiveConfig = AdaptiveConfig()
    ): List<TopicScoreRecord> {
        if (questions.isEmpty()) return emptyList()
        val grouped = linkedMapOf<String, MutableList<Pair<Question, Boolean>>>()
        questions.forEachIndexed { idx, q ->
            val meta = resolveTopic(q)
            val isCorrect = userAnswers[idx] == q.correctIndex
            grouped.getOrPut(meta.topicKey) { mutableListOf() }.add(q to isCorrect)
        }
        return grouped.entries.map { (topicKey, list) ->
            val firstQ = list.first().first
            val meta = resolveTopic(firstQ)
            val correctCount = list.count { it.second }
            val totalCount = list.size
            val uniqueCount = list.map { it.first.id }.distinct().size
            val pct = if (totalCount > 0) ((correctCount.toDouble() / totalCount) * 100.0).roundToInt() else 0
            val conf = computeConfidence(totalCount, uniqueCount, config)
            TopicScoreRecord(
                topicKey = topicKey,
                topicName = meta.topicName,
                domainId = firstQ.domainId,
                domainName = firstQ.domainName,
                correctCount = correctCount,
                totalCount = totalCount,
                percentage = pct,
                confidence = conf
            )
        }
    }

    fun buildRecommendations(
        topicStates: List<TopicMasteryState>,
        domainSummaries: List<DomainMasterySummary>,
        questions: List<Question>,
        hasCompletedBaseline: Boolean,
        nowMillis: Long,
        config: AdaptiveConfig = AdaptiveConfig()
    ): List<PracticeRecommendation> {
        if (questions.isEmpty()) return emptyList()
        val recs = mutableListOf<PracticeRecommendation>()

        if (!hasCompletedBaseline) {
            recs.add(
                PracticeRecommendation(
                    id = "rec_initial_assessment",
                    title = "Take Initial Assessment",
                    reason = "Establish a fixed baseline across available domains before targeted practice.",
                    mode = ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT,
                    badgeLabel = "START HERE",
                    priority = 100
                )
            )
        }

        val dueTopics = topicStates.filter { it.isAssessed && it.nextReviewDueAtMillis in 1L..nowMillis }
        if (dueTopics.isNotEmpty()) {
            recs.add(
                PracticeRecommendation(
                    id = "rec_retention_review",
                    title = "Retention Review (${dueTopics.size} topic${if (dueTopics.size == 1) "" else "s"} due)",
                    reason = "Revisit previously missed or scheduled items before forgetting sets in.",
                    mode = ExamMode.RETENTION_REVIEW,
                    badgeLabel = "DUE NOW",
                    priority = 95
                )
            )
        }

        val weakTopics = topicStates
            .filter { it.isAssessed && it.masteryPercent < config.weakThresholdPercent }
            .sortedBy { it.masteryPercent }

        if (weakTopics.isNotEmpty()) {
            val weakest = weakTopics.first()
            recs.add(
                PracticeRecommendation(
                    id = "rec_weak_topics",
                    title = "Practise Weak Topics",
                    reason = "Lowest: ${weakest.topicName} (${weakest.masteryPercent}% mastery across ${weakest.attemptCount} Qs).",
                    mode = ExamMode.AI_ADAPTIVE_DRILL,
                    targetTopicKey = weakest.topicKey,
                    badgeLabel = "PRIORITY",
                    priority = 90
                )
            )
        }

        val insufficientTopics = topicStates.filter {
            it.isAssessed && it.confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE
        }
        if (insufficientTopics.isNotEmpty()) {
            val t = insufficientTopics.first()
            recs.add(
                PracticeRecommendation(
                    id = "rec_insufficient_${t.topicKey}",
                    title = "Verify ${t.topicName}",
                    reason = "Only ${t.attemptCount} question(s) answered — insufficient evidence to confirm mastery.",
                    mode = ExamMode.AI_ADAPTIVE_DRILL,
                    targetTopicKey = t.topicKey,
                    badgeLabel = "LOW EVIDENCE",
                    priority = 75
                )
            )
        }

        val unassessedDomains = domainSummaries.filter { !it.isAssessed }
        if (unassessedDomains.isNotEmpty()) {
            val d = unassessedDomains.first()
            recs.add(
                PracticeRecommendation(
                    id = "rec_unassessed_${d.domainId}",
                    title = "Explore ${d.domainName}",
                    reason = "Not assessed yet — try a short drill to establish initial topic evidence.",
                    mode = ExamMode.DOMAIN_PRACTICE,
                    targetDomainId = d.domainId,
                    badgeLabel = "NOT ASSESSED",
                    priority = 65
                )
            )
        }

        if (recs.none { it.mode == ExamMode.AI_ADAPTIVE_DRILL }) {
            recs.add(
                PracticeRecommendation(
                    id = "rec_adaptive_general",
                    title = "Adaptive Practice Session",
                    reason = "Balanced offline mix prioritizing weak areas, low-evidence topics, and spaced review.",
                    mode = ExamMode.AI_ADAPTIVE_DRILL,
                    badgeLabel = "ADAPTIVE",
                    priority = 60
                )
            )
        }

        return recs.sortedByDescending { it.priority }
    }
}

