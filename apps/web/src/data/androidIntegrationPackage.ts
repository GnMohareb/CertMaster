import {
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  FIREBASE_AUTH_DOMAIN,
  OAUTH_CLIENT_ID,
} from '../lib/firebase';

export const ANDROID_INTEGRATION_SUMMARY = {
  targetAndroidAppId: '3cc96170-31c4-46dd-822d-0ed45a0ac3fe',
  webCompanionAppId: 'ad2ba0f9-3a61-45af-b60a-14f5eb4f6001',
  firebaseProjectId: FIREBASE_PROJECT_ID,
  firestoreDatabaseId: FIRESTORE_DATABASE_ID,
  authDomain: FIREBASE_AUTH_DOMAIN,
  oAuthClientId: OAUTH_CLIENT_ID,
  schemaVersion: 2,
  collections: [
    {
      path: '/users/{userId}',
      entity: 'UserProfile',
      syncMode: 'Bi-Directional Real-Time (onSnapshot / addSnapshotListener)',
      description: 'Central user profile, learning preferences (theme, targetExamId, dailyStudyGoalMinutes), and calibrated behavioral archetype.',
    },
    {
      path: '/users/{userId}/private/{docId}',
      entity: 'UserPrivatePII',
      syncMode: 'Owner-Only Isolated Read/Write',
      description: 'Isolated PII collection storing verified email address (docId = "pii").',
    },
    {
      path: '/users/{userId}/subscriptions/{examId}',
      entity: 'SubscriptionEntitlementDoc',
      syncMode: 'Bi-Directional Real-Time',
      description: 'Cross-platform exam entitlements across all 112 certification banks (ACTIVE, TRIAL, EXPIRED, LOCKED).',
    },
    {
      path: '/users/{userId}/attempts/{attemptId}',
      entity: 'ExamAttemptRecord',
      syncMode: 'Append-Only Immutable Real-Time Stream',
      description: 'Completed simulation and diagnostic attempts with domain score breakdowns, dwell latency, and cognitive stress score.',
    },
    {
      path: '/users/{userId}/flashcards/{cardId}',
      entity: 'FlashcardProgress',
      syncMode: 'Bi-Directional Real-Time',
      description: '3D active recall spaced-repetition mastery states (unstudied, known, needs_review) and review counts.',
    },
    {
      path: '/users/{userId}/studyPlans/{planId}',
      entity: 'StudyPlan',
      syncMode: 'Bi-Directional Real-Time',
      description: 'Personalized exam study schedule, weekly hours, and priority focus domains (bounded array <= 10).',
    },
    {
      path: '/users/{userId}/readiness/{examId}',
      entity: 'ExamReadiness',
      syncMode: 'Bi-Directional Real-Time',
      description: 'Per-exam readiness score, pass probability, and weakest domain telemetry.',
    },
    {
      path: '/users/{userId}/syncEvents/{eventId}',
      entity: 'SyncEventDoc',
      syncMode: 'Append-Only Audit Log',
      description: 'Immutable cross-platform synchronization audit trail (WEB_TO_ANDROID and ANDROID_TO_WEB).',
    },
  ],
};

export const KOTLIN_ANDROID_SNIPPET = `// CertMaster Native Android App (3cc96170-31c4-46dd-822d-0ed45a0ac3fe)
// 1. Initialize Named Firestore Instance (CRITICAL: Do not use default instance)
val db = FirebaseFirestore.getInstance(
    FirebaseApp.getInstance(),
    "${FIRESTORE_DATABASE_ID}"
)
val auth = FirebaseAuth.getInstance()

// 2. Listen for Real-Time Profile & Preference Changes from Web Platform
db.collection("users").document(auth.currentUser!!.uid)
    .addSnapshotListener { snapshot, error ->
        if (error != null || snapshot == null || !snapshot.exists()) return@addSnapshotListener
        val tier = snapshot.getString("subscriptionTier")
        val readiness = snapshot.getLong("assessmentScorePercent")
        val theme = snapshot.getString("preferredTheme")
        val targetExamId = snapshot.getString("targetExamId")
        // Update Android ViewModel StateFlow
    }

// 3. Push Completed Android Exam Simulation to Shared Cloud
val attemptId = "att_android_\${System.currentTimeMillis()}"
db.collection("users").document(uid)
    .collection("attempts").document(attemptId)
    .set(mapOf(
        "attemptId" to attemptId,
        "userId" to uid,
        "examId" to "cissp",
        "attemptType" to "SIMULATION",
        "platform" to "ANDROID",
        "scorePercent" to 84,
        "totalQuestions" to 8,
        "correctAnswers" to 7,
        "timeSpentMinutes" to 112,
        "averageDwellSec" to 39,
        "stressScore" to 61,
        "dateString" to "2026-10-30",
        "domainScores" to mapOf(
            "Security & Risk Management" to 88,
            "Asset Security" to 85,
            "Security Architecture & Engineering" to 80
        ),
        "createdAt" to FieldValue.serverTimestamp()
    ))`;
