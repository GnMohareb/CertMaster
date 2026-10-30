package com.certmaster.app.data.sync

import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

/**
 * CertMaster Native Android Application - Official Cloud Synchronization Repository
 *
 * Connects to the shared CertMaster Cloud Firestore instance:
 * - Project ID: gen-lang-client-0788513176
 * - Firestore Database ID: ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001
 */
object CertMasterCloudConfig {
    const val FIREBASE_PROJECT_ID = "gen-lang-client-0788513176"
    const val FIRESTORE_DATABASE_ID = "ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001"
    const val OAUTH_WEB_CLIENT_ID = "814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com"
    const val SCHEMA_VERSION = 2
}

class CertMasterFirestoreRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance(
        FirebaseApp.getInstance(),
        CertMasterCloudConfig.FIRESTORE_DATABASE_ID
    )
) {
    /**
     * Real-time observer for /users/{userId}
     */
    fun observeUserProfile(userId: String): Flow<Map<String, Any>?> = callbackFlow {
        val registration: ListenerRegistration = db.collection("users")
            .document(userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                trySend(snapshot?.data)
            }
        awaitClose { registration.remove() }
    }

    /**
     * Real-time observer for /users/{userId}/subscriptions
     */
    fun observeSubscriptions(userId: String): Flow<List<Map<String, Any>>> = callbackFlow {
        val registration = db.collection("users")
            .document(userId)
            .collection("subscriptions")
            .whereEqualTo("userId", userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val docs = snapshot?.documents?.mapNotNull { it.data } ?: emptyList()
                trySend(docs)
            }
        awaitClose { registration.remove() }
    }

    /**
     * Real-time observer for /users/{userId}/attempts
     */
    fun observeExamAttempts(userId: String): Flow<List<Map<String, Any>>> = callbackFlow {
        val registration = db.collection("users")
            .document(userId)
            .collection("attempts")
            .whereEqualTo("userId", userId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val docs = snapshot?.documents?.mapNotNull { it.data } ?: emptyList()
                trySend(docs)
            }
        awaitClose { registration.remove() }
    }

    /**
     * Record a completed exam attempt from Android and update readiness + sync audit log
     */
    suspend fun recordAndroidExamAttempt(
        attemptId: String,
        examId: String,
        attemptType: String,
        scorePercent: Int,
        totalQuestions: Int,
        correctAnswers: Int,
        timeSpentMinutes: Int,
        averageDwellSec: Int,
        stressScore: Int,
        dateString: String,
        domainScores: Map<String, Int>
    ) {
        val uid = auth.currentUser?.uid ?: throw IllegalStateException("User not signed in")
        val batch = db.batch()

        val attemptRef = db.collection("users").document(uid)
            .collection("attempts").document(attemptId)

        val attemptPayload = mapOf(
            "attemptId" to attemptId,
            "userId" to uid,
            "examId" to examId,
            "attemptType" to attemptType,
            "platform" to "ANDROID",
            "scorePercent" to scorePercent.coerceIn(0, 100),
            "totalQuestions" to totalQuestions.coerceIn(1, 500),
            "correctAnswers" to correctAnswers.coerceIn(0, totalQuestions),
            "timeSpentMinutes" to timeSpentMinutes.coerceIn(0, 600),
            "averageDwellSec" to averageDwellSec.coerceIn(0, 3600),
            "stressScore" to stressScore.coerceIn(0, 100),
            "dateString" to dateString.take(32),
            "domainScores" to domainScores,
            "createdAt" to FieldValue.serverTimestamp()
        )
        batch.set(attemptRef, attemptPayload)

        // Log sync event
        val syncEventId = "sync_android_${System.currentTimeMillis()}"
        val syncRef = db.collection("users").document(uid)
            .collection("syncEvents").document(syncEventId)

        batch.set(
            syncRef,
            mapOf(
                "eventId" to syncEventId,
                "userId" to uid,
                "direction" to "ANDROID_TO_WEB",
                "action" to "Android Exam Attempt Completed ($examId)",
                "status" to "SUCCESS",
                "payloadSummary" to "Score: $scorePercent% ($correctAnswers/$totalQuestions) synced from Android to Web",
                "createdAt" to FieldValue.serverTimestamp()
            )
        )

        batch.commit().await()
    }

    /**
     * Update learning preferences (theme, target exam, daily study goal) from Android
     */
    suspend fun updateLearningPreferences(
        preferredTheme: String,
        targetExamId: String,
        dailyStudyGoalMinutes: Int,
        androidDeviceId: String
    ) {
        val uid = auth.currentUser?.uid ?: throw IllegalStateException("User not signed in")
        db.collection("users").document(uid).update(
            mapOf(
                "preferredTheme" to preferredTheme,
                "targetExamId" to targetExamId,
                "dailyStudyGoalMinutes" to dailyStudyGoalMinutes.coerceIn(5, 720),
                "androidDeviceId" to androidDeviceId.take(128),
                "lastActivePlatform" to "ANDROID",
                "updatedAt" to FieldValue.serverTimestamp()
            )
        ).await()
    }
}
