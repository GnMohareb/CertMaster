package com.example.model

enum class SubStatus {
    ACTIVE,
    TRIAL_ACTIVE,
    LOCKED,
    EXPIRED;

    fun toWebStatusString(): String = when (this) {
        ACTIVE -> "ACTIVE"
        TRIAL_ACTIVE -> "TRIAL"
        LOCKED -> "LOCKED"
        EXPIRED -> "EXPIRED"
    }

    companion object {
        fun fromWebStatusString(raw: String?): SubStatus = when (raw?.uppercase()) {
            "ACTIVE" -> ACTIVE
            "TRIAL", "TRIAL_ACTIVE" -> TRIAL_ACTIVE
            "EXPIRED" -> EXPIRED
            else -> LOCKED
        }
    }
}

enum class PlatformOrigin {
    WEB,
    ANDROID,
    UNIVERSAL_SYNC
}

enum class SyncConnectionState {
    SYNCHRONIZED,
    PENDING,
    OFFLINE_CACHED,
    CONFLICT_RESOLVED,
    DISCONNECTED
}

data class SsoSessionInfo(
    val isAuthenticated: Boolean = false,
    val provider: String = "Google Identity Services (OIDC)",
    val issuer: String = "https://accounts.google.com",
    val clientId: String = "814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com",
    /** Firebase Auth UID. Empty until a real sign-in succeeds. Never a hardcoded/demo value. */
    val ssoSubjectId: String = "",
    val email: String = "",
    val displayName: String = "",
    val emailVerified: Boolean = false,
    val grantedScopes: List<String> = emptyList(),
    val sessionStartedAt: Long = 0L,
    val tokenExpiresAt: Long = 0L,
    val jwtTokenPreview: String = "",
    val androidDeviceId: String = "",
    /** One of: SIGNED_OUT, LOCAL_ONLY, SYNC_PENDING, SYNCHRONIZED, SYNC_FAILED, DISCONNECTED. */
    val syncStatus: String = "SIGNED_OUT"
)

data class ExamSubscription(
    val examId: String,
    val examTitle: String,
    val shortCode: String,
    val status: SubStatus,
    val subscribedPlatform: String, // "Central Web Platform (Stripe)", "Android Play In-App", "WEB", "ANDROID", "UNIVERSAL_SYNC"
    val validUntilDate: String,
    val priceFormatted: String,
    val universalAccess: Boolean = true, // Unlocks both Web & Mobile
    val vendor: String = "(ISC)²",
    val platformOrigin: PlatformOrigin = PlatformOrigin.UNIVERSAL_SYNC,
    val activeSessionsCount: Int = 1
)

data class JourneyMilestone(
    val stage: Int, // 1 to 5
    val stageName: String,
    val status: String, // "COMPLETED", "IN_PROGRESS", "LOCKED", "READY"
    val score: Int? = null,
    val lastUpdated: String? = null,
    val description: String,
    val actionLabel: String,
    val actionRoute: String
)

data class ExamReadinessReport(
    val examId: String,
    val readinessPercent: Int,
    val passProbabilityPercent: Int,
    val cognitiveStressIndex: Int,
    val behavioralArchetype: String,
    val passGuaranteeQualified: Boolean,
    val currentJourneyStage: Int,
    val completedSimulationsCount: Int,
    val highestSimulationScore: Int,
    val weakestDomainId: String,
    val weakestDomainName: String,
    val weakestDomainScore: Int
)

data class DomainPerformancePoint(
    val date: String,
    val timestamp: Long,
    val domainId: String,
    val domainName: String,
    val scorePercent: Int,
    val avgResponseTimeSec: Int,
    val stressFactor: Int
)

data class SyncLogEntry(
    val id: String,
    val timestamp: Long,
    val source: String, // "WEB" | "ANDROID"
    val direction: String, // "UPSTREAM_PUSH" | "DOWNSTREAM_PULL"
    val status: String, // "SUCCESS" | "CONFLICT_RESOLVED" | "PENDING"
    val message: String,
    val payloadSummary: String
)

data class UserCentralProfile(
    val schemaVersion: Int = 2,
    /** Firebase Auth UID. Empty while signed out; never a demo identity. */
    val userId: String = "",
    val email: String = "",
    val displayName: String = "",
    val avatarUrl: String = "",
    val preferredTheme: String = "dark",
    val targetExamId: String = "cissp",
    val lastActivePlatform: String = "ANDROID",
    /** Paid tiers are granted only by server-side payment verification, never by default. */
    val subscriptionTier: String = "Free Trial",
    val centralPortalUrl: String = "https://ais-dev-c43kxdgpgcs6kaaoha4sx7-109050751533.us-west2.run.app",
    val assessmentCompleted: Boolean = false,
    val assessmentScorePercent: Int = 0,
    val cognitiveStressBaseline: Int = 0,
    val behavioralArchetype: String = "",
    val hesitationNotes: String = "",
    val averageDwellTimeSec: Int = 0,
    val distractorEliminationRate: Double = 0.0,
    val optionSwitchCountAvg: Double = 0.0,
    val deviceSyncedCount: Int = 0,
    val currentJourneyStage: Int = 1,
    val completedSimulationsCount: Int = 0,
    val highestSimulationScore: Int = 0,
    val examTargetDate: String = "",
    /** Entitlements come only from the server/Firestore. Empty by default. */
    val subscriptions: List<ExamSubscription> = emptyList(),
    val lastSyncTimestampMillis: Long = 0L
)
