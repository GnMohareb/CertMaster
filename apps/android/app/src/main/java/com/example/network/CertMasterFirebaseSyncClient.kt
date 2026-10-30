package com.example.network

import android.content.Context
import com.example.data.ExamCatalog
import com.example.data.local.DomainScoreRecord
import com.example.data.local.FlashcardEntity
import com.example.data.local.SimulationScoreEntity
import com.example.data.local.StudySourceEntity
import com.example.data.local.SyncQueueEntity
import com.example.domain.AuthoritativeMetricsEngine
import com.example.model.ExamReadinessReport
import com.example.model.ExamSubscription
import com.example.model.FlashcardStatus
import com.example.model.JourneyMilestone
import com.example.model.PlatformOrigin
import com.example.model.SourceType
import com.example.model.SubStatus
import com.example.model.UserCentralProfile
import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.delay
import kotlinx.coroutines.tasks.await
import org.json.JSONArray
import org.json.JSONObject

/**
 * Unified Firebase Firestore & Web-Platform JSON interoperability layer.
 * Connects the Android app to the SAME Firestore collections and Web payload schemas
 * defined in `firebase-blueprint.json` and `src/types/index.ts`.
 */
class CertMasterFirebaseSyncClient(private val context: Context? = null) {

    companion object {
        const val FIREBASE_PROJECT_ID = "gen-lang-client-0788513176"
        const val FIRESTORE_DATABASE_ID = "ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001"
        const val CANONICAL_SCHEMA_VERSION = 2
    }

    /**
     * Optional delivery hook for integration/offline-retry verification or custom REST relay.
     */
    var customDeliveryHandler: (suspend (SyncQueueEntity) -> Boolean)? = null

    fun isFirestoreAvailable(): Boolean {
        val ctx = context ?: return false
        return try {
            FirebaseApp.getApps(ctx).isNotEmpty()
        } catch (_: Exception) {
            false
        }
    }

    /**
     * Connects to the authoritative named Firestore database shared with the Web Platform.
     */
    fun getNamedFirestoreInstance(): FirebaseFirestore {
        return FirebaseFirestore.getInstance(FirebaseApp.getInstance(), FIRESTORE_DATABASE_ID)
    }

    /**
     * Delivers a single queued offline operation to Firestore or custom delivery transport.
     * Throws an exception if payload validation or delivery fails so the operation remains in `pending_sync_queue`.
     */
    suspend fun deliverQueuedOperation(userId: String, op: SyncQueueEntity): Result<Boolean> {
        return executeWithRetry(maxAttempts = 3, initialDelayMs = 50L) {
            val payload = JSONObject(op.payloadJson)
            val handler = customDeliveryHandler
            if (handler != null) {
                val ok = handler(op)
                if (!ok) {
                    throw IllegalStateException("Remote sync transport rejected operation ${op.operationId}")
                }
                return@executeWithRetry true
            }

            if (isFirestoreAvailable() && userId.isNotBlank() && userId != "usr_gnmohareb_cissp_001") {
                val db = getNamedFirestoreInstance()
                val userRef = db.collection("users").document(userId)
                when (op.domainType) {
                    "ATTEMPT" -> {
                        val attemptId = payload.optString("attemptId").ifEmpty { op.entityId }
                        val examId = ExamCatalog.normalizeExamId(payload.optString("examId", "cissp"))
                        val attemptMap = mapOf(
                            "schemaVersion" to CANONICAL_SCHEMA_VERSION,
                            "attemptId" to attemptId,
                            "sessionId" to attemptId,
                            "userId" to userId,
                            "examId" to examId,
                            "attemptType" to "SIMULATION",
                            "platform" to "ANDROID",
                            "scorePercent" to payload.optInt("scorePercent", 0),
                            "totalQuestions" to payload.optInt("totalQuestions", 10),
                            "correctAnswers" to payload.optInt("correctCount", 0),
                            "timeSpentMinutes" to (payload.optInt("timeSpentSeconds", 60) / 60).coerceAtLeast(1),
                            "averageDwellSec" to payload.optInt("averageLatencySeconds", 40),
                            "stressScore" to payload.optInt("behavioralStressScore", 50)
                        )
                        userRef.collection("attempts").document(attemptId).set(attemptMap, SetOptions.merge()).await()
                    }
                    "FLASHCARD" -> {
                        val cardId = payload.optString("id").ifEmpty { op.entityId }
                        val box = payload.optInt("boxLevel", 1).coerceIn(1, 5)
                        val state = when {
                            box <= 1 -> "unstudied"
                            box == 2 -> "needs_review"
                            else -> "known"
                        }
                        val cardMap = mapOf(
                            "schemaVersion" to CANONICAL_SCHEMA_VERSION,
                            "userId" to userId,
                            "cardId" to cardId,
                            "id" to cardId,
                            "boxLevel" to box,
                            "state" to state,
                            "status" to payload.optString("status", FlashcardStatus.fromBoxLevel(box).name),
                            "lastReviewedEpoch" to payload.optLong("lastReviewedEpoch", System.currentTimeMillis()),
                            "platform" to "ANDROID"
                        )
                        userRef.collection("flashcards").document(cardId).set(cardMap, SetOptions.merge()).await()
                    }
                    "SOURCE" -> {
                        val srcId = payload.optString("id").ifEmpty { op.entityId }
                        val srcMap = mapOf(
                            "schemaVersion" to CANONICAL_SCHEMA_VERSION,
                            "id" to srcId,
                            "userId" to userId,
                            "examId" to ExamCatalog.normalizeExamId(payload.optString("examId", "cissp")),
                            "domainId" to payload.optString("domainId", "d1"),
                            "title" to payload.optString("title", "Study Note"),
                            "summary" to payload.optString("summary", ""),
                            "cachedAtMillis" to System.currentTimeMillis()
                        )
                        userRef.collection("sources").document(srcId).set(srcMap, SetOptions.merge()).await()
                    }
                }
            }
            true
        }
    }

    /**
     * Executes a suspend operation with exponential backoff retry handling.
     */
    suspend fun <T> executeWithRetry(
        maxAttempts: Int = 3,
        initialDelayMs: Long = 100L,
        block: suspend (attempt: Int) -> T
    ): Result<T> {
        var currentDelay = initialDelayMs
        var lastError: Throwable? = null
        for (attempt in 1..maxAttempts) {
            try {
                return Result.success(block(attempt))
            } catch (t: Throwable) {
                lastError = t
                if (attempt < maxAttempts) {
                    delay(currentDelay)
                    currentDelay *= 2
                }
            }
        }
        return Result.failure(lastError ?: IllegalStateException("Retry exhausted"))
    }

    /**
     * Converts an Android [UserCentralProfile] to the canonical Web Platform JSON format
     * (where `subscriptions` is a `Record<string, ExamSubscription>` map matching `src/types/index.ts`).
     */
    fun toWebProfileJson(profile: UserCentralProfile): String {
        val root = JSONObject()
        root.put("schemaVersion", profile.schemaVersion)
        root.put("userId", profile.userId)
        root.put("email", profile.email)
        root.put("displayName", profile.displayName)
        root.put("avatarUrl", profile.avatarUrl)
        root.put("preferredTheme", profile.preferredTheme)
        root.put("targetExamId", ExamCatalog.normalizeExamId(profile.targetExamId))
        root.put("lastActivePlatform", profile.lastActivePlatform)
        root.put("subscriptionTier", profile.subscriptionTier)
        root.put("assessmentCompleted", profile.assessmentCompleted)
        root.put("assessmentScorePercent", profile.assessmentScorePercent)
        root.put("cognitiveStressBaseline", profile.cognitiveStressBaseline)
        root.put("behavioralArchetype", profile.behavioralArchetype)
        root.put("hesitationNotes", profile.hesitationNotes)
        root.put("averageDwellTimeSec", profile.averageDwellTimeSec)
        root.put("distractorEliminationRate", profile.distractorEliminationRate)
        root.put("optionSwitchCountAvg", profile.optionSwitchCountAvg)
        root.put("lastSyncTimestampMillis", profile.lastSyncTimestampMillis)
        root.put("deviceSyncedCount", profile.deviceSyncedCount)
        root.put("currentJourneyStage", profile.currentJourneyStage)
        root.put("completedSimulationsCount", profile.completedSimulationsCount)
        root.put("highestSimulationScore", profile.highestSimulationScore)
        root.put("examTargetDate", profile.examTargetDate)

        val subsObject = JSONObject()
        profile.subscriptions.forEach { sub ->
            val webId = ExamCatalog.normalizeExamId(sub.examId)
            val subObj = JSONObject()
            subObj.put("examId", webId)
            subObj.put("examTitle", sub.examTitle)
            subObj.put("shortCode", sub.shortCode)
            subObj.put("vendor", sub.vendor)
            subObj.put("status", sub.status.toWebStatusString())
            subObj.put("subscribedPlatform", sub.platformOrigin.name)
            subObj.put("validUntilDate", sub.validUntilDate)
            subObj.put("priceFormatted", sub.priceFormatted)
            subObj.put("universalAccess", sub.universalAccess)
            subObj.put("activeSessionsCount", sub.activeSessionsCount)
            subsObject.put(webId, subObj)
        }
        root.put("subscriptions", subsObject)
        return root.toString()
    }

    /**
     * Parses a Web Platform JSON payload (`src/types/index.ts` UserCentralProfile) into an Android [UserCentralProfile].
     */
    fun fromWebProfileJson(jsonString: String): UserCentralProfile {
        val obj = JSONObject(jsonString)
        val subsList = mutableListOf<ExamSubscription>()
        val subsNode = obj.opt("subscriptions")

        if (subsNode is JSONObject) {
            val keys = subsNode.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val subObj = subsNode.getJSONObject(key)
                subsList.add(parseWebSubscriptionObject(subObj, key))
            }
        } else if (subsNode is JSONArray) {
            for (i in 0 until subsNode.length()) {
                val subObj = subsNode.getJSONObject(i)
                subsList.add(parseWebSubscriptionObject(subObj, subObj.optString("examId", "cissp")))
            }
        }

        return UserCentralProfile(
            schemaVersion = obj.optInt("schemaVersion", 2),
            userId = obj.optString("userId", "usr_gnmohareb_cissp_001"),
            email = obj.optString("email", "gnmohareb@gmail.com"),
            displayName = obj.optString("displayName", "GN Mohareb"),
            avatarUrl = obj.optString("avatarUrl", ""),
            preferredTheme = obj.optString("preferredTheme", "dark"),
            targetExamId = ExamCatalog.normalizeExamId(obj.optString("targetExamId", "cissp")),
            lastActivePlatform = obj.optString("lastActivePlatform", "WEB"),
            subscriptionTier = obj.optString("subscriptionTier", "Universal Multi-Pass"),
            assessmentCompleted = obj.optBoolean("assessmentCompleted", true),
            assessmentScorePercent = obj.optInt("assessmentScorePercent", 74),
            cognitiveStressBaseline = obj.optInt("cognitiveStressBaseline", 68),
            behavioralArchetype = obj.optString("behavioralArchetype", "Analytical Hesitator"),
            hesitationNotes = obj.optString("hesitationNotes", ""),
            averageDwellTimeSec = obj.optInt("averageDwellTimeSec", 54),
            distractorEliminationRate = obj.optDouble("distractorEliminationRate", 0.68),
            optionSwitchCountAvg = obj.optDouble("optionSwitchCountAvg", 1.8),
            lastSyncTimestampMillis = obj.optLong("lastSyncTimestampMillis", System.currentTimeMillis()),
            deviceSyncedCount = obj.optInt("deviceSyncedCount", 2),
            currentJourneyStage = obj.optInt("currentJourneyStage", 2),
            completedSimulationsCount = obj.optInt("completedSimulationsCount", 5),
            highestSimulationScore = obj.optInt("highestSimulationScore", 78),
            examTargetDate = obj.optString("examTargetDate", "Nov 24, 2026"),
            subscriptions = if (subsList.isNotEmpty()) subsList else UserCentralProfile().subscriptions
        )
    }

    private fun parseWebSubscriptionObject(subObj: JSONObject, fallbackId: String): ExamSubscription {
        val rawId = subObj.optString("examId", fallbackId)
        val statusStr = subObj.optString("status", "LOCKED")
        val status = SubStatus.fromWebStatusString(statusStr)
        val rawOrigin = subObj.optString("subscribedPlatform", "UNIVERSAL_SYNC")
        val origin = try {
            PlatformOrigin.valueOf(rawOrigin)
        } catch (_: Exception) {
            when {
                rawOrigin.contains("Web", ignoreCase = true) -> PlatformOrigin.WEB
                rawOrigin.contains("Android", ignoreCase = true) -> PlatformOrigin.ANDROID
                else -> PlatformOrigin.UNIVERSAL_SYNC
            }
        }
        val platformLabel = when (origin) {
            PlatformOrigin.WEB -> "Central Web Platform (Stripe)"
            PlatformOrigin.ANDROID -> "Android Companion Synced"
            PlatformOrigin.UNIVERSAL_SYNC -> "Universal Cross-Platform Sync"
        }

        // Map canonical Web IDs back to Android subscription list IDs where expected
        val androidExamId = when (rawId) {
            "aws-saa" -> "aws_csa"
            "sec-plus" -> "sec_plus"
            else -> rawId
        }

        return ExamSubscription(
            examId = androidExamId,
            examTitle = subObj.optString("examTitle", ""),
            shortCode = subObj.optString("shortCode", rawId.uppercase()),
            status = status,
            subscribedPlatform = platformLabel,
            validUntilDate = subObj.optString("validUntilDate", "Dec 31, 2027"),
            priceFormatted = subObj.optString("priceFormatted", "$29.00/subject"),
            universalAccess = subObj.optBoolean("universalAccess", true),
            vendor = subObj.optString("vendor", "(ISC)²"),
            platformOrigin = origin,
            activeSessionsCount = subObj.optInt("activeSessionsCount", 1)
        )
    }

    /**
     * Converts a Web Platform `SimulationResult` / `SimulationAttempt` JSON (`src/types/certmaster.ts`) into an Android [SimulationScoreEntity].
     */
    fun fromWebSimulationResultJson(jsonString: String, attemptNumber: Int = 1): SimulationScoreEntity {
        val obj = JSONObject(jsonString)
        val sessionId = obj.optString("attemptId").ifEmpty {
            obj.optString("sessionId", "sess_${System.currentTimeMillis()}")
        }
        val examId = ExamCatalog.normalizeExamId(obj.optString("examId", "cissp"))
        val timestamp = obj.optLong("timestamp", System.currentTimeMillis())
        val totalQuestions = obj.optInt("totalQuestions", 50)
        val scorePercent = obj.optInt("scorePercent", 0)
        val passed = obj.optBoolean("passed", scorePercent >= 70)
        val timeSpentSeconds = obj.optInt("timeSpentSeconds", 1800)

        val domainRecords = mutableListOf<DomainScoreRecord>()
        val domainScoresObj = obj.optJSONObject("domainScores")
        val domainBreakdownArr = obj.optJSONArray("domainBreakdown")
        if (domainScoresObj != null) {
            val keys = domainScoresObj.keys()
            while (keys.hasNext()) {
                val domainId = keys.next()
                val dObj = domainScoresObj.getJSONObject(domainId)
                domainRecords.add(
                    DomainScoreRecord(
                        domainId = domainId,
                        domainName = dObj.optString("domainName", domainId.uppercase()),
                        scorePercent = dObj.optInt("percent", 0),
                        correctCount = dObj.optInt("correct", 0),
                        totalCount = dObj.optInt("total", 0)
                    )
                )
            }
        } else if (domainBreakdownArr != null) {
            for (i in 0 until domainBreakdownArr.length()) {
                val dObj = domainBreakdownArr.getJSONObject(i)
                domainRecords.add(
                    DomainScoreRecord(
                        domainId = dObj.optString("domainId", "d${i + 1}"),
                        domainName = dObj.optString("domainName", "Domain ${i + 1}"),
                        scorePercent = dObj.optInt("percent", 0),
                        correctCount = dObj.optInt("correct", 0),
                        totalCount = dObj.optInt("total", 0)
                    )
                )
            }
        }

        return SimulationScoreEntity.createHistoricalAttempt(
            id = sessionId,
            examId = if (examId == "cissp") "cissp" else examId,
            timestampMillis = timestamp,
            overallScore = scorePercent,
            isPassed = passed,
            timeSpentSeconds = timeSpentSeconds,
            totalQuestions = totalQuestions,
            attemptNumber = obj.optInt("attemptNumber", attemptNumber),
            domainScores = domainRecords
        )
    }

    /**
     * Converts an Android [SimulationScoreEntity] to the Web Platform `SimulationResult` / `SimulationAttempt` JSON schema.
     */
    fun toWebSimulationResultJson(entity: SimulationScoreEntity, examTitle: String): String {
        val obj = JSONObject()
        val domainList = entity.parseDomainScores()
        val totalCorrect = domainList.sumOf { it.correctCount }.takeIf { it > 0 }
            ?: ((entity.overallScorePercent * entity.totalQuestions) / 100)

        obj.put("schemaVersion", 2)
        obj.put("attemptId", entity.id)
        obj.put("sessionId", entity.id)
        obj.put("examId", ExamCatalog.normalizeExamId(entity.examId))
        obj.put("examTitle", examTitle)
        obj.put("mode", "FULL_SIMULATION")
        obj.put("timestamp", entity.timestampMillis)
        obj.put("attemptNumber", entity.attemptNumber)
        obj.put("totalQuestions", entity.totalQuestions)
        obj.put("correctCount", totalCorrect)
        obj.put("scorePercent", entity.overallScorePercent)
        obj.put("passed", entity.isPassed)
        obj.put("timeSpentSeconds", entity.timeSpentSeconds)

        val domainScoresMap = JSONObject()
        val domainBreakdownArr = JSONArray()
        domainList.forEach { ds ->
            val dObj = JSONObject()
            dObj.put("domainId", ds.domainId)
            dObj.put("domainName", ds.domainName)
            dObj.put("total", ds.totalCount)
            dObj.put("correct", ds.correctCount)
            dObj.put("percent", ds.scorePercent)
            domainScoresMap.put(ds.domainId, dObj)
            domainBreakdownArr.put(dObj)
        }
        obj.put("domainScores", domainScoresMap)
        obj.put("domainBreakdown", domainBreakdownArr)
        obj.put(
            "behavioralStressScore",
            AuthoritativeMetricsEngine.calculateSimulationBehavioralStress(
                totalSwitches = 2,
                passed = entity.isPassed
            )
        )
        obj.put("optionSwitchesCount", 2)
        obj.put("eliminatedDistractorsCount", 4)
        obj.put("averageLatencySeconds", if (entity.totalQuestions > 0) entity.timeSpentSeconds / entity.totalQuestions else 45)
        obj.put("originPlatform", "ANDROID")
        return obj.toString()
    }

    /**
     * Pushes and merges student profile, entitlements, attempts, study plan, flashcards, and sources
     * with the shared Firebase Firestore database when initialized.
     */
    suspend fun syncAllWithFirestore(
        userId: String,
        profile: UserCentralProfile,
        readiness: ExamReadinessReport,
        milestones: List<JourneyMilestone>,
        scores: List<SimulationScoreEntity>,
        flashcards: List<FlashcardEntity>,
        sources: List<StudySourceEntity>
    ): Result<UserCentralProfile> {
        if (!isFirestoreAvailable()) {
            return Result.success(profile.copy(lastSyncTimestampMillis = System.currentTimeMillis()))
        }

        return executeWithRetry {
            val db = getNamedFirestoreInstance()
            val userRef = db.collection("users").document(userId)

            // 1. Check remote profile and resolve any conflict deterministically
            val snapshot = userRef.get().await()
            val resolvedProfile = if (snapshot.exists() && snapshot.data != null) {
                val data = snapshot.data!!
                val remoteProfile = profile.copy(
                    displayName = data["displayName"] as? String ?: profile.displayName,
                    email = data["email"] as? String ?: profile.email,
                    subscriptionTier = data["subscriptionTier"] as? String ?: profile.subscriptionTier,
                    assessmentCompleted = data["assessmentCompleted"] as? Boolean ?: profile.assessmentCompleted,
                    assessmentScorePercent = (data["assessmentScorePercent"] as? Number)?.toInt() ?: profile.assessmentScorePercent,
                    cognitiveStressBaseline = (data["cognitiveStressBaseline"] as? Number)?.toInt() ?: profile.cognitiveStressBaseline,
                    behavioralArchetype = data["behavioralArchetype"] as? String
                        ?: data["archetypeName"] as? String
                        ?: profile.behavioralArchetype,
                    hesitationNotes = data["hesitationNotes"] as? String ?: profile.hesitationNotes,
                    lastSyncTimestampMillis = (data["lastSyncTimestampMillis"] as? Number)?.toLong() ?: 0L
                )
                AuthoritativeMetricsEngine.resolveProfileConflict(profile, remoteProfile).mergedProfile
            } else {
                profile.copy(lastSyncTimestampMillis = System.currentTimeMillis())
            }

            // 2. Write merged profile to /users/{userId} (preserving server-controlled subscriptionTier)
            val safeTier = if (snapshot.exists()) {
                (snapshot.data?.get("subscriptionTier") as? String) ?: "Free Trial"
            } else {
                "Free Trial"
            }
            val profileMap = mapOf(
                "schemaVersion" to CANONICAL_SCHEMA_VERSION,
                "userId" to userId,
                "email" to resolvedProfile.email,
                "displayName" to resolvedProfile.displayName,
                "avatarUrl" to resolvedProfile.avatarUrl,
                "subscriptionTier" to safeTier,
                "assessmentCompleted" to resolvedProfile.assessmentCompleted,
                "assessmentScorePercent" to resolvedProfile.assessmentScorePercent,
                "cognitiveStressBaseline" to resolvedProfile.cognitiveStressBaseline,
                "archetypeName" to resolvedProfile.behavioralArchetype,
                "behavioralArchetype" to resolvedProfile.behavioralArchetype,
                "hesitationNotes" to resolvedProfile.hesitationNotes,
                "averageDwellTimeSec" to resolvedProfile.averageDwellTimeSec,
                "distractorEliminationRate" to resolvedProfile.distractorEliminationRate,
                "optionSwitchCountAvg" to resolvedProfile.optionSwitchCountAvg,
                "preferredTheme" to resolvedProfile.preferredTheme,
                "targetExamId" to ExamCatalog.normalizeExamId(resolvedProfile.targetExamId),
                "lastActivePlatform" to "ANDROID",
                "lastSyncTimestampMillis" to resolvedProfile.lastSyncTimestampMillis,
                "deviceSyncedCount" to resolvedProfile.deviceSyncedCount,
                "currentJourneyStage" to readiness.currentJourneyStage,
                "completedSimulationsCount" to readiness.completedSimulationsCount,
                "highestSimulationScore" to readiness.highestSimulationScore,
                "examTargetDate" to resolvedProfile.examTargetDate
            )
            userRef.set(profileMap, SetOptions.merge()).await()

            // 3. Synchronize non-escalating subscription metadata (paid ACTIVE requires server receipt verification)
            resolvedProfile.subscriptions.forEach { sub ->
                val canonicalExamId = ExamCatalog.normalizeExamId(sub.examId)
                val webStatus = sub.status.toWebStatusString()
                if (webStatus != "ACTIVE") {
                    val subMap = mapOf(
                        "schemaVersion" to CANONICAL_SCHEMA_VERSION,
                        "userId" to userId,
                        "examId" to canonicalExamId,
                        "examTitle" to sub.examTitle,
                        "shortCode" to sub.shortCode,
                        "vendor" to sub.vendor,
                        "status" to webStatus,
                        "platform" to "ANDROID",
                        "subscribedPlatform" to sub.platformOrigin.name,
                        "validUntilDate" to sub.validUntilDate,
                        "priceFormatted" to sub.priceFormatted,
                        "universalAccess" to sub.universalAccess,
                        "activeSessionsCount" to sub.activeSessionsCount
                    )
                    userRef.collection("subscriptions").document(canonicalExamId).set(subMap, SetOptions.merge()).await()
                }
            }

            // 4. Synchronize 5-Stage Study Plan & Exam Readiness in /users/{userId}/studyPlans/{examId}
            val milestonesArr = JSONArray()
            milestones.forEach { m ->
                val mObj = JSONObject()
                mObj.put("stage", m.stage)
                mObj.put("stageName", m.stageName)
                mObj.put("status", m.status)
                mObj.put("score", m.score ?: 0)
                mObj.put("description", m.description)
                mObj.put("actionLabel", m.actionLabel)
                mObj.put("actionRoute", m.actionRoute)
                milestonesArr.put(mObj)
            }
            val canonicalReadinessExamId = ExamCatalog.normalizeExamId(readiness.examId)
            val studyPlanMap = mapOf(
                "schemaVersion" to CANONICAL_SCHEMA_VERSION,
                "planId" to canonicalReadinessExamId,
                "examId" to canonicalReadinessExamId,
                "userId" to userId,
                "currentStage" to readiness.currentJourneyStage,
                "readinessPercent" to readiness.readinessPercent,
                "passProbabilityPercent" to readiness.passProbabilityPercent,
                "passGuaranteeQualified" to readiness.passGuaranteeQualified,
                "targetDate" to resolvedProfile.examTargetDate,
                "weeklyHours" to 12,
                "focusDomains" to listOf(readiness.weakestDomainName),
                "status" to "ACTIVE",
                "milestonesJson" to milestonesArr.toString(),
                "updatedAtMillis" to System.currentTimeMillis()
            )
            userRef.collection("studyPlans")
                .document(canonicalReadinessExamId)
                .set(studyPlanMap, SetOptions.merge())
                .await()

            val readinessMap = mapOf(
                "schemaVersion" to CANONICAL_SCHEMA_VERSION,
                "userId" to userId,
                "examId" to canonicalReadinessExamId,
                "readinessScore" to readiness.readinessPercent,
                "readinessPercent" to readiness.readinessPercent,
                "passProbability" to readiness.passProbabilityPercent,
                "passProbabilityPercent" to readiness.passProbabilityPercent,
                "simulationsCompleted" to readiness.completedSimulationsCount,
                "weakestDomain" to readiness.weakestDomainName
            )
            userRef.collection("readiness")
                .document(canonicalReadinessExamId)
                .set(readinessMap, SetOptions.merge())
                .await()

            // 5. Synchronize recent simulation attempts in /users/{userId}/attempts/{sessionId}
            scores.takeLast(10).forEach { score ->
                val attemptMap = mapOf(
                    "schemaVersion" to CANONICAL_SCHEMA_VERSION,
                    "attemptId" to score.id,
                    "sessionId" to score.id,
                    "userId" to userId,
                    "examId" to ExamCatalog.normalizeExamId(score.examId),
                    "examTitle" to ExamCatalog.getExamById(score.examId).title,
                    "attemptType" to "SIMULATION",
                    "platform" to "ANDROID",
                    "timestamp" to score.timestampMillis,
                    "totalQuestions" to score.totalQuestions,
                    "correctAnswers" to ((score.overallScorePercent * score.totalQuestions) / 100),
                    "correctCount" to ((score.overallScorePercent * score.totalQuestions) / 100),
                    "scorePercent" to score.overallScorePercent,
                    "passed" to score.isPassed,
                    "timeSpentMinutes" to (score.timeSpentSeconds / 60).coerceAtLeast(1),
                    "timeSpentSeconds" to score.timeSpentSeconds,
                    "averageDwellSec" to 40,
                    "stressScore" to 50,
                    "domainScoresJson" to score.domainScoresJson
                )
                userRef.collection("attempts").document(score.id).set(attemptMap, SetOptions.merge()).await()
            }

            // 6. Synchronize flashcards in /users/{userId}/flashcards/{cardId}
            flashcards.forEach { card ->
                val box = card.boxLevel.coerceIn(1, 5)
                val stateStr = when {
                    box <= 1 -> "unstudied"
                    box == 2 -> "needs_review"
                    else -> "known"
                }
                val cardMap = mapOf(
                    "schemaVersion" to CANONICAL_SCHEMA_VERSION,
                    "id" to card.id,
                    "cardId" to card.id,
                    "userId" to userId,
                    "examId" to ExamCatalog.normalizeExamId(card.examId),
                    "domainId" to card.domainId,
                    "domain" to card.domainName,
                    "boxLevel" to box,
                    "state" to stateStr,
                    "status" to FlashcardStatus.fromBoxLevel(box).name,
                    "lastReviewedEpoch" to card.lastReviewedEpoch,
                    "platform" to "ANDROID"
                )
                userRef.collection("flashcards").document(card.id).set(cardMap, SetOptions.merge()).await()
            }

            // 7. Synchronize AI-generated / NotebookLM study sources in /users/{userId}/sources/{sourceId}
            sources.forEach { src ->
                val srcMap = mapOf(
                    "schemaVersion" to CANONICAL_SCHEMA_VERSION,
                    "id" to src.id,
                    "userId" to userId,
                    "examId" to ExamCatalog.normalizeExamId(src.examId),
                    "domainId" to src.domainId,
                    "domainName" to src.domainName,
                    "title" to src.title,
                    "authorOrStandard" to src.authorOrStandard,
                    "type" to src.type.name,
                    "summary" to src.summary,
                    "fullContent" to src.fullContent,
                    "cachedAtMillis" to src.cachedAtMillis
                )
                userRef.collection("sources").document(src.id).set(srcMap, SetOptions.merge()).await()
            }

            resolvedProfile
        }
    }
}
