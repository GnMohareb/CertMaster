package com.example.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.model.ExamSubscription
import com.example.model.PlatformOrigin
import com.example.model.SubStatus
import com.example.model.UserCentralProfile
import org.json.JSONArray
import org.json.JSONObject

@Entity(tableName = "cached_user_profiles")
data class UserProfileEntity(
    @PrimaryKey val userId: String,
    val email: String,
    val displayName: String,
    val avatarUrl: String,
    val subscriptionTier: String,
    val centralPortalUrl: String,
    val assessmentCompleted: Boolean,
    val assessmentScorePercent: Int,
    val cognitiveStressBaseline: Int,
    val behavioralArchetype: String,
    val hesitationNotes: String,
    val averageDwellTimeSec: Int,
    val distractorEliminationRate: Double,
    val optionSwitchCountAvg: Double,
    val deviceSyncedCount: Int,
    val currentJourneyStage: Int,
    val completedSimulationsCount: Int,
    val highestSimulationScore: Int,
    val examTargetDate: String,
    val subscriptionsJson: String,
    val lastSyncTimestampMillis: Long
) {
    fun toUserCentralProfile(): UserCentralProfile {
        val subs = parseSubscriptions(subscriptionsJson)
        return UserCentralProfile(
            userId = userId,
            email = email,
            displayName = displayName,
            avatarUrl = avatarUrl,
            subscriptionTier = subscriptionTier,
            centralPortalUrl = centralPortalUrl,
            assessmentCompleted = assessmentCompleted,
            assessmentScorePercent = assessmentScorePercent,
            cognitiveStressBaseline = cognitiveStressBaseline,
            behavioralArchetype = behavioralArchetype,
            hesitationNotes = hesitationNotes,
            averageDwellTimeSec = averageDwellTimeSec,
            distractorEliminationRate = distractorEliminationRate,
            optionSwitchCountAvg = optionSwitchCountAvg,
            deviceSyncedCount = deviceSyncedCount,
            currentJourneyStage = currentJourneyStage,
            completedSimulationsCount = completedSimulationsCount,
            highestSimulationScore = highestSimulationScore,
            examTargetDate = examTargetDate,
            subscriptions = subs,
            lastSyncTimestampMillis = lastSyncTimestampMillis
        )
    }

    companion object {
        fun fromUserCentralProfile(profile: UserCentralProfile): UserProfileEntity {
            val arr = JSONArray()
            profile.subscriptions.forEach { sub ->
                val obj = JSONObject()
                obj.put("examId", sub.examId)
                obj.put("examTitle", sub.examTitle)
                obj.put("shortCode", sub.shortCode)
                obj.put("status", sub.status.name)
                obj.put("subscribedPlatform", sub.subscribedPlatform)
                obj.put("validUntilDate", sub.validUntilDate)
                obj.put("priceFormatted", sub.priceFormatted)
                obj.put("universalAccess", sub.universalAccess)
                obj.put("vendor", sub.vendor)
                obj.put("platformOrigin", sub.platformOrigin.name)
                obj.put("activeSessionsCount", sub.activeSessionsCount)
                arr.put(obj)
            }
            return UserProfileEntity(
                userId = profile.userId,
                email = profile.email,
                displayName = profile.displayName,
                avatarUrl = profile.avatarUrl,
                subscriptionTier = profile.subscriptionTier,
                centralPortalUrl = profile.centralPortalUrl,
                assessmentCompleted = profile.assessmentCompleted,
                assessmentScorePercent = profile.assessmentScorePercent,
                cognitiveStressBaseline = profile.cognitiveStressBaseline,
                behavioralArchetype = profile.behavioralArchetype,
                hesitationNotes = profile.hesitationNotes,
                averageDwellTimeSec = profile.averageDwellTimeSec,
                distractorEliminationRate = profile.distractorEliminationRate,
                optionSwitchCountAvg = profile.optionSwitchCountAvg,
                deviceSyncedCount = profile.deviceSyncedCount,
                currentJourneyStage = profile.currentJourneyStage,
                completedSimulationsCount = profile.completedSimulationsCount,
                highestSimulationScore = profile.highestSimulationScore,
                examTargetDate = profile.examTargetDate,
                subscriptionsJson = arr.toString(),
                lastSyncTimestampMillis = profile.lastSyncTimestampMillis
            )
        }

        private fun parseSubscriptions(json: String): List<ExamSubscription> {
            if (json.isBlank() || json == "[]") return emptyList()
            return try {
                val arr = JSONArray(json)
                val list = mutableListOf<ExamSubscription>()
                for (i in 0 until arr.length()) {
                    val obj = arr.getJSONObject(i)
                    val status = SubStatus.fromWebStatusString(obj.optString("status", "LOCKED"))
                    val origin = try {
                        PlatformOrigin.valueOf(obj.optString("platformOrigin", "UNIVERSAL_SYNC"))
                    } catch (_: Exception) {
                        PlatformOrigin.UNIVERSAL_SYNC
                    }
                    list.add(
                        ExamSubscription(
                            examId = obj.optString("examId", "cissp"),
                            examTitle = obj.optString("examTitle", ""),
                            shortCode = obj.optString("shortCode", ""),
                            status = status,
                            subscribedPlatform = obj.optString("subscribedPlatform", "Universal Cross-Platform Sync"),
                            validUntilDate = obj.optString("validUntilDate", ""),
                            priceFormatted = obj.optString("priceFormatted", "$29.00/subject"),
                            universalAccess = obj.optBoolean("universalAccess", true),
                            vendor = obj.optString("vendor", "(ISC)²"),
                            platformOrigin = origin,
                            activeSessionsCount = obj.optInt("activeSessionsCount", 1)
                        )
                    )
                }
                list
            } catch (_: Exception) {
                emptyList()
            }
        }
    }
}

@Entity(tableName = "cached_study_plans")
data class StudyPlanEntity(
    @PrimaryKey val examId: String,
    val userId: String,
    val currentStage: Int,
    val readinessPercent: Int,
    val passProbabilityPercent: Int,
    val passGuaranteeQualified: Boolean,
    val weakestDomainId: String,
    val weakestDomainName: String,
    val weakestDomainScore: Int,
    val targetDate: String,
    val milestonesJson: String,
    val updatedAtMillis: Long
)

@Entity(tableName = "pending_sync_queue")
data class SyncQueueEntity(
    @PrimaryKey val operationId: String,
    val domainType: String, // "PROFILE", "ENTITLEMENT", "ATTEMPT", "FLASHCARD", "SOURCE", "STUDY_PLAN"
    val entityId: String,
    val payloadJson: String,
    val createdAtMillis: Long,
    val retryCount: Int = 0,
    val lastError: String? = null
)
