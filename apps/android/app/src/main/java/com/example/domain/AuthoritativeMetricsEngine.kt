package com.example.domain

import com.example.data.ExamCatalog
import com.example.data.local.FlashcardEntity
import com.example.data.local.SimulationScoreEntity
import com.example.model.DomainStressMetrics
import com.example.model.ExamConfig
import com.example.model.ExamReadinessReport
import com.example.model.ExamSubscription
import com.example.model.Flashcard
import com.example.model.FlashcardStatus
import com.example.model.JourneyMilestone
import com.example.model.PlatformOrigin
import com.example.model.StressLevel
import com.example.model.SubStatus
import com.example.model.UserCentralProfile
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Authoritative calculation and conflict-resolution engine shared with the CertMaster Web Platform.
 * Every formula in this object is identical to the TypeScript implementation in:
 * - src/screens/AssessmentScreen.tsx
 * - src/screens/SimulatorScreen.tsx
 * - src/screens/UserAreaScreen.tsx
 * - src/services/apiSyncService.ts
 */
object AuthoritativeMetricsEngine {

    data class ArchetypeClassification(
        val archetype: String,
        val cognitiveStressBaseline: Int,
        val distractorEliminationRate: Double,
        val optionSwitchCountAvg: Double,
        val hesitationNotes: String
    )

    data class ProfileConflictResolution(
        val mergedProfile: UserCentralProfile,
        val hadConflict: Boolean,
        val resolutionSummary: String
    )

    /**
     * Exact match with Web Platform AssessmentScreen.tsx (lines 118-149).
     */
    fun classifyBehavioralArchetype(
        scorePct: Int,
        avgLatencySec: Int,
        totalSwitches: Int,
        totalEliminations: Int,
        totalQuestions: Int = 10
    ): ArchetypeClassification {
        val (archetype, stress) = when {
            scorePct >= 85 && avgLatencySec < 40 && totalSwitches <= 2 -> "Confident Master" to 35
            totalEliminations >= 6 && scorePct >= 70 -> "Deliberate Strategist" to 54
            avgLatencySec < 22 && scorePct < 70 -> "Fast Guesser" to 72
            avgLatencySec >= 45 || totalSwitches >= 4 -> "Analytical Hesitator" to 68
            else -> "Methodical Verifier" to 50
        }

        val elimRate = calculateDistractorEliminationRate(totalEliminations, totalQuestions)
        val switchAvg = calculateOptionSwitchAvg(totalSwitches, totalQuestions)
        val notes = "Calibrated via 10-Question Diagnostic Engine. Average question dwell time: ${avgLatencySec}s. Option oscillation: $totalSwitches switches. Distractor strikes: $totalEliminations."

        return ArchetypeClassification(
            archetype = archetype,
            cognitiveStressBaseline = stress,
            distractorEliminationRate = elimRate,
            optionSwitchCountAvg = switchAvg,
            hesitationNotes = notes
        )
    }

    /**
     * Exact match with Web Platform SimulatorScreen.tsx (line 211):
     * stressScore = Math.min(100, Math.max(30, 50 + totalSwitches * 5 - (passed ? 15 : 0)))
     */
    fun calculateSimulationBehavioralStress(totalSwitches: Int, passed: Boolean): Int {
        val raw = 50 + (totalSwitches * 5) - (if (passed) 15 else 0)
        return min(100, max(30, raw))
    }

    /**
     * Exact match with Web Platform AssessmentScreen.tsx (line 146):
     * Math.min(1, Math.round((totalEliminations / (total * 3)) * 100) / 100)
     */
    fun calculateDistractorEliminationRate(totalEliminations: Int, totalQuestions: Int): Double {
        if (totalQuestions <= 0) return 0.0
        val ratio = totalEliminations.toDouble() / (totalQuestions * 3.0)
        val rounded = (ratio * 100.0).roundToInt() / 100.0
        return min(1.0, max(0.0, rounded))
    }

    /**
     * Exact match with Web Platform AssessmentScreen.tsx (line 147):
     * Math.round((totalSwitches / total) * 10) / 10
     */
    fun calculateOptionSwitchAvg(totalSwitches: Int, totalQuestions: Int): Double {
        if (totalQuestions <= 0) return 0.0
        return ((totalSwitches.toDouble() / totalQuestions.toDouble()) * 10.0).roundToInt() / 10.0
    }

    /**
     * Authoritative domain cognitive stress calculation used across Dashboard & Analytics.
     */
    fun calculateDomainStressScore(
        accuracyPercent: Int,
        flagRatePercent: Int,
        avgResponseSeconds: Int
    ): Pair<Int, StressLevel> {
        val accuracyDeficit = (100 - accuracyPercent).coerceIn(0, 100)
        val rawStress = (accuracyDeficit * 0.55) +
            (flagRatePercent * 0.25) +
            (((avgResponseSeconds - 45).coerceAtLeast(0) / 60.0) * 20.0)
        val stressScore = rawStress.toInt().coerceIn(5, 98)

        val level = when {
            stressScore >= 70 -> StressLevel.CRITICAL_STRESS
            stressScore >= 50 -> StressLevel.HIGH_ATTENTION
            stressScore >= 35 -> StressLevel.MODERATE_PRACTICE
            stressScore >= 18 -> StressLevel.ON_TRACK
            else -> StressLevel.MASTERED
        }
        return stressScore to level
    }

    /**
     * Authoritative Exam Readiness & Pass Guarantee calculation matching Web Platform UserAreaScreen.tsx.
     */
    fun calculateAuthoritativeReadiness(
        exam: ExamConfig,
        profile: UserCentralProfile,
        simulationScores: List<SimulationScoreEntity>,
        flashcards: List<Flashcard>,
        domainMetrics: List<DomainStressMetrics>
    ): ExamReadinessReport {
        val simScoresForExam = simulationScores.filter {
            ExamCatalog.matchesExamId(it.examId, exam.id)
        }

        val avgSimScore = if (simScoresForExam.isNotEmpty()) {
            simScoresForExam.map { it.overallScorePercent }.average().roundToInt()
        } else {
            profile.assessmentScorePercent
        }

        val highestSimScore = simScoresForExam.maxOfOrNull { it.overallScorePercent }
            ?: profile.highestSimulationScore

        val knownCardsCount = flashcards.count {
            it.status == FlashcardStatus.KNOWN || it.boxLevel >= 3
        }
        val isOfflineCsc = exam.id.startsWith("csc-part-")
        val flashcardMasteryPct = if (flashcards.isNotEmpty()) {
            ((knownCardsCount.toDouble() / flashcards.size.toDouble()) * 100.0).roundToInt()
        } else {
            if (isOfflineCsc) 0 else 70
        }

        // Weighted readiness: 60% simulation performance, 25% diagnostic baseline, 15% active recall mastery
        val hasRealData = !isOfflineCsc || simScoresForExam.isNotEmpty() || profile.assessmentCompleted || flashcards.isNotEmpty()
        val readinessPercent = if (!hasRealData) {
            0
        } else {
            val raw = ((avgSimScore * 0.60) + (profile.assessmentScorePercent * 0.25) + (flashcardMasteryPct * 0.15)).roundToInt()
            if (isOfflineCsc) raw.coerceIn(0, 100) else raw.coerceIn(10, 100)
        }

        val passThreshold = exam.passingScorePercent
        val passProbabilityPercent = when {
            !hasRealData -> 0
            readinessPercent >= passThreshold + 10 -> min(98, readinessPercent + 6)
            readinessPercent >= passThreshold -> min(92, readinessPercent + 3)
            else -> if (isOfflineCsc) max(0, readinessPercent - 5) else max(15, readinessPercent - 5)
        }

        val weakestDomain = domainMetrics.minByOrNull { it.accuracyPercent }
        val weakestDomainId = weakestDomain?.domainId ?: exam.domains.firstOrNull()?.id.orEmpty()
        val weakestDomainName = weakestDomain?.domainName ?: exam.domains.firstOrNull()?.title.orEmpty()
        val weakestDomainScore = weakestDomain?.accuracyPercent ?: avgSimScore

        val passGuaranteeQualified = readinessPercent >= passThreshold &&
            simScoresForExam.count { it.isPassed } >= 2

        val currentStage = when {
            !profile.assessmentCompleted -> 1
            weakestDomainScore < 65 -> 2
            simScoresForExam.size < 3 -> 3
            !passGuaranteeQualified -> 4
            else -> 5
        }

        return ExamReadinessReport(
            examId = exam.id,
            readinessPercent = readinessPercent,
            passProbabilityPercent = passProbabilityPercent,
            cognitiveStressIndex = profile.cognitiveStressBaseline,
            behavioralArchetype = profile.behavioralArchetype,
            passGuaranteeQualified = passGuaranteeQualified,
            currentJourneyStage = currentStage,
            completedSimulationsCount = max(simScoresForExam.size, profile.completedSimulationsCount),
            highestSimulationScore = highestSimScore,
            weakestDomainId = weakestDomainId,
            weakestDomainName = weakestDomainName,
            weakestDomainScore = weakestDomainScore
        )
    }

    /**
     * Generates the 5-Stage Mastery Journey shared between Web Platform (UserAreaScreen.tsx) and Android.
     */
    fun buildFiveStageStudyPlan(
        exam: ExamConfig,
        profile: UserCentralProfile,
        readiness: ExamReadinessReport
    ): List<JourneyMilestone> {
        val isOfflineCsc = exam.id.startsWith("csc-part-")
        val stage1Done = profile.assessmentCompleted
        val stage2Done = readiness.weakestDomainScore >= 65
        val stage3Done = readiness.completedSimulationsCount >= 3 && readiness.highestSimulationScore >= exam.passingScorePercent
        val stage4Done = readiness.passGuaranteeQualified
        val stage2FocusLabel = readiness.weakestDomainName.ifBlank { "Priority Exam Topics" }

        return listOf(
            JourneyMilestone(
                stage = 1,
                stageName = "Baseline Diagnostic & Behavioral Telemetry",
                status = if (stage1Done) "COMPLETED" else "IN_PROGRESS",
                score = profile.assessmentScorePercent,
                lastUpdated = if (isOfflineCsc) "On Device" else "Synchronized",
                description = "Calibrates question dwell times and hesitation option switches. Archetype: ${profile.behavioralArchetype.ifBlank { "Pending Assessment" }} (${profile.averageDwellTimeSec}s avg dwell).",
                actionLabel = "Recalibrate (10 Questions)",
                actionRoute = "INITIAL_BEHAVIORAL_ASSESSMENT"
            ),
            JourneyMilestone(
                stage = 2,
                stageName = "Targeted Weak Domain Mastery & Grounded Citations",
                status = when {
                    !stage1Done -> "LOCKED"
                    stage2Done -> "COMPLETED"
                    else -> "IN_PROGRESS"
                },
                score = readiness.weakestDomainScore,
                lastUpdated = "Active Focus",
                description = "Priority remediation for $stage2FocusLabel (${readiness.weakestDomainScore}%) using study guides and spaced-repetition flashcards.",
                actionLabel = "Open Study Sources",
                actionRoute = "NOTEBOOK_SOURCES"
            ),
            JourneyMilestone(
                stage = 3,
                stageName = "High-Stress Timed Simulation & Distractor Elimination",
                status = when {
                    stage3Done -> "COMPLETED"
                    stage1Done -> "IN_PROGRESS"
                    else -> "LOCKED"
                },
                score = readiness.highestSimulationScore,
                lastUpdated = "${readiness.completedSimulationsCount} Mocks Completed",
                description = "Train under exact ${exam.shortCode} certification timing with distractor strikethrough and question flagging.",
                actionLabel = "Launch Exam Simulator",
                actionRoute = "EXAM_HUB"
            ),
            JourneyMilestone(
                stage = 4,
                stageName = "Domain Heatmap & Pass Readiness Verification",
                status = when {
                    stage4Done -> "COMPLETED"
                    stage3Done -> "READY"
                    else -> "IN_PROGRESS"
                },
                score = readiness.passProbabilityPercent,
                lastUpdated = "${readiness.passProbabilityPercent}% Pass Probability",
                description = if (readiness.passGuaranteeQualified) {
                    "Consistent passing readiness verified (${readiness.readinessPercent}% readiness)."
                } else {
                    "Reach ${exam.passingScorePercent}%+ across simulations to verify exam readiness."
                },
                actionLabel = "View Analytics",
                actionRoute = "DASHBOARD"
            ),
            if (isOfflineCsc) {
                JourneyMilestone(
                    stage = 5,
                    stageName = "Offline Readiness & Testing Center Preparation",
                    status = if (stage4Done) "READY" else "IN_PROGRESS",
                    score = readiness.readinessPercent,
                    lastUpdated = "Stored Locally",
                    description = "All simulation scores, flashcards, and study notes are saved locally on this device for offline test-day review.",
                    actionLabel = "View Study Progress",
                    actionRoute = "DASHBOARD"
                )
            } else {
                JourneyMilestone(
                    stage = 5,
                    stageName = "Cross-Device Sync & Testing Center Preparation",
                    status = if (stage4Done) "READY" else "IN_PROGRESS",
                    score = readiness.readinessPercent,
                    lastUpdated = "Target: ${profile.examTargetDate}",
                    description = "Web Companion and Android app offline banks, flashcards, and simulation scores are synchronized for test day.",
                    actionLabel = "Verify Cloud Sync",
                    actionRoute = "CENTRAL_PROFILE"
                )
            }
        )
    }

    /**
     * Deterministic cross-platform conflict resolution for UserCentralProfile & Subscriptions:
     * 1. Subscriptions: Union-merges entitlements by canonical examId. An ACTIVE status on EITHER Web or Android
     *    always wins over TRIAL_ACTIVE/LOCKED/EXPIRED so a purchase on Web or Android is never lost during offline edits.
     * 2. Progress counters: Preserves max(completedSimulationsCount), max(highestSimulationScore), max(deviceSyncedCount).
     * 3. Behavioral telemetry & profile fields: Last-Write-Wins based on lastSyncTimestampMillis.
     */
    fun resolveProfileConflict(
        local: UserCentralProfile,
        remote: UserCentralProfile
    ): ProfileConflictResolution {
        val remoteIsNewer = remote.lastSyncTimestampMillis >= local.lastSyncTimestampMillis
        val primary = if (remoteIsNewer) remote else local
        val secondary = if (remoteIsNewer) local else remote

        // Union merge subscriptions by normalized exam ID
        val mergedSubsMap = linkedMapOf<String, ExamSubscription>()

        fun statusPriority(status: SubStatus): Int = when (status) {
            SubStatus.ACTIVE -> 4
            SubStatus.TRIAL_ACTIVE -> 3
            SubStatus.EXPIRED -> 2
            SubStatus.LOCKED -> 1
        }

        (local.subscriptions + remote.subscriptions).forEach { sub ->
            val key = ExamCatalog.normalizeExamId(sub.examId)
            val existing = mergedSubsMap[key]
            if (existing == null) {
                mergedSubsMap[key] = sub
            } else {
                val winner = if (statusPriority(sub.status) > statusPriority(existing.status)) {
                    sub.copy(
                        examId = existing.examId, // preserve local canonical key format for UI compatibility
                        universalAccess = true,
                        platformOrigin = PlatformOrigin.UNIVERSAL_SYNC,
                        activeSessionsCount = max(existing.activeSessionsCount, sub.activeSessionsCount)
                    )
                } else {
                    existing.copy(
                        universalAccess = true,
                        activeSessionsCount = max(existing.activeSessionsCount, sub.activeSessionsCount)
                    )
                }
                mergedSubsMap[key] = winner
            }
        }

        val mergedTier = if (
            local.subscriptionTier == "Universal Multi-Pass" ||
            remote.subscriptionTier == "Universal Multi-Pass"
        ) {
            "Universal Multi-Pass"
        } else {
            primary.subscriptionTier
        }

        val hadConflict = local.lastSyncTimestampMillis != remote.lastSyncTimestampMillis &&
            (local.assessmentScorePercent != remote.assessmentScorePercent ||
                local.subscriptions != remote.subscriptions)

        val resolved = primary.copy(
            subscriptionTier = mergedTier,
            assessmentCompleted = local.assessmentCompleted || remote.assessmentCompleted,
            completedSimulationsCount = max(local.completedSimulationsCount, remote.completedSimulationsCount),
            highestSimulationScore = max(local.highestSimulationScore, remote.highestSimulationScore),
            deviceSyncedCount = max(max(local.deviceSyncedCount, remote.deviceSyncedCount), 2),
            currentJourneyStage = max(local.currentJourneyStage, remote.currentJourneyStage),
            subscriptions = mergedSubsMap.values.toList(),
            lastSyncTimestampMillis = max(local.lastSyncTimestampMillis, remote.lastSyncTimestampMillis)
        )

        val summary = if (hadConflict) {
            "Resolved cross-platform conflict (${if (remoteIsNewer) "Remote Web newer" else "Local Android newer"}); merged ${resolved.subscriptions.count { it.status == SubStatus.ACTIVE }} active entitlements."
        } else {
            "Synchronized cleanly without conflicts."
        }

        return ProfileConflictResolution(
            mergedProfile = resolved,
            hadConflict = hadConflict,
            resolutionSummary = summary
        )
    }

    /**
     * Deterministic conflict resolution for Flashcard progress across Web and Android:
     * Most recent review timestamp wins; on timestamp tie, higher Leitner boxLevel wins.
     */
    fun resolveFlashcardConflict(
        local: FlashcardEntity,
        remote: FlashcardEntity
    ): FlashcardEntity {
        return when {
            remote.lastReviewedEpoch > local.lastReviewedEpoch -> remote
            local.lastReviewedEpoch > remote.lastReviewedEpoch -> local
            remote.boxLevel >= local.boxLevel -> remote
            else -> local
        }
    }

    /**
     * Deterministic merge of simulation attempt histories from Web and Android:
     * Deduplicates by session/attempt ID and orders chronologically with sequential attempt numbers.
     */
    fun mergeSimulationScores(
        localScores: List<SimulationScoreEntity>,
        remoteScores: List<SimulationScoreEntity>
    ): List<SimulationScoreEntity> {
        val byId = linkedMapOf<String, SimulationScoreEntity>()
        (localScores + remoteScores)
            .sortedBy { it.timestampMillis }
            .forEach { entity ->
                val existing = byId[entity.id]
                if (existing == null || entity.overallScorePercent >= existing.overallScorePercent) {
                    byId[entity.id] = entity
                }
            }

        return byId.values
            .sortedBy { it.timestampMillis }
            .mapIndexed { idx, item -> item.copy(attemptNumber = idx + 1) }
    }
}
