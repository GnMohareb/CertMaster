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
    val isAuthenticated: Boolean = true,
    val provider: String = "Google Identity Services (OIDC)",
    val issuer: String = "https://accounts.google.com",
    val clientId: String = "certmaster-sso-production.apps.googleusercontent.com",
    val ssoSubjectId: String = "usr_gnmohareb_cissp_001",
    val email: String = "gnmohareb@gmail.com",
    val displayName: String = "GN Mohareb",
    val emailVerified: Boolean = true,
    val grantedScopes: List<String> = listOf(
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ),
    val sessionStartedAt: Long = System.currentTimeMillis() - 7200_000L,
    val tokenExpiresAt: Long = System.currentTimeMillis() + 79200_000L,
    val jwtTokenPreview: String = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjRiMWY5YSIsInR5cCI6IkpXVCJ9...",
    val androidDeviceId: String = "pixel8pro_android_gnm_77a9",
    val syncStatus: String = "SYNCHRONIZED"
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
    val userId: String = "usr_gnmohareb_cissp_001",
    val email: String = "gnmohareb@gmail.com",
    val displayName: String = "GN Mohareb",
    val avatarUrl: String = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    val preferredTheme: String = "dark",
    val targetExamId: String = "cissp",
    val lastActivePlatform: String = "ANDROID",
    val subscriptionTier: String = "Universal Multi-Pass",
    val centralPortalUrl: String = "https://ais-dev-c43kxdgpgcs6kaaoha4sx7-109050751533.us-west2.run.app",
    val assessmentCompleted: Boolean = true,
    val assessmentScorePercent: Int = 74,
    val cognitiveStressBaseline: Int = 68,
    val behavioralArchetype: String = "Analytical Hesitator",
    val hesitationNotes: String = "Extended deliberation on Security Architecture and PKI scenarios (average latency 78s); fast execution on Asset Security and Risk Management.",
    val averageDwellTimeSec: Int = 54,
    val distractorEliminationRate: Double = 0.68,
    val optionSwitchCountAvg: Double = 1.8,
    val deviceSyncedCount: Int = 2,
    val currentJourneyStage: Int = 2,
    val completedSimulationsCount: Int = 5,
    val highestSimulationScore: Int = 78,
    val examTargetDate: String = "Nov 24, 2026",
    val subscriptions: List<ExamSubscription> = listOf(
        ExamSubscription(
            examId = "cissp",
            examTitle = "Certified Information Systems Security Professional",
            shortCode = "CISSP",
            status = SubStatus.ACTIVE,
            subscribedPlatform = "Central Web Platform (Stripe)",
            validUntilDate = "Dec 31, 2027",
            priceFormatted = "$29.00/subject",
            vendor = "(ISC)²",
            platformOrigin = PlatformOrigin.WEB,
            activeSessionsCount = 14
        ),
        ExamSubscription(
            examId = "aws_csa",
            examTitle = "AWS Certified Solutions Architect - Associate",
            shortCode = "AWS-SAA",
            status = SubStatus.ACTIVE,
            subscribedPlatform = "Android Companion Synced",
            validUntilDate = "Nov 15, 2027",
            priceFormatted = "$29.00/subject",
            vendor = "Amazon Web Services",
            platformOrigin = PlatformOrigin.ANDROID,
            activeSessionsCount = 8
        ),
        ExamSubscription(
            examId = "sec_plus",
            examTitle = "CompTIA Security+ SY0-701",
            shortCode = "Sec+",
            status = SubStatus.ACTIVE,
            subscribedPlatform = "Universal Cross-Platform Sync",
            validUntilDate = "Oct 30, 2027",
            priceFormatted = "$29.00/subject",
            vendor = "CompTIA",
            platformOrigin = PlatformOrigin.UNIVERSAL_SYNC,
            activeSessionsCount = 5
        ),
        ExamSubscription(
            examId = "pmp",
            examTitle = "Project Management Professional",
            shortCode = "PMP®",
            status = SubStatus.ACTIVE,
            subscribedPlatform = "Central Web Platform (Stripe)",
            validUntilDate = "Jan 20, 2028",
            priceFormatted = "$29.00/subject",
            vendor = "Project Management Institute",
            platformOrigin = PlatformOrigin.UNIVERSAL_SYNC,
            activeSessionsCount = 9
        ),
        ExamSubscription(
            examId = "cism",
            examTitle = "Certified Information Security Manager",
            shortCode = "CISM",
            status = SubStatus.TRIAL_ACTIVE,
            subscribedPlatform = "Central Web Platform (Trial)",
            validUntilDate = "Expires in 6 days",
            priceFormatted = "$29.00/subject",
            vendor = "ISACA",
            platformOrigin = PlatformOrigin.WEB,
            activeSessionsCount = 2
        ),
        ExamSubscription(
            examId = "ceh",
            examTitle = "Certified Ethical Hacker v12",
            shortCode = "CEH",
            status = SubStatus.LOCKED,
            subscribedPlatform = "Unsubscribed",
            validUntilDate = "Locked",
            priceFormatted = "$29.00/subject",
            vendor = "EC-Council",
            platformOrigin = PlatformOrigin.WEB,
            activeSessionsCount = 0
        )
    ),
    val lastSyncTimestampMillis: Long = System.currentTimeMillis()
)
