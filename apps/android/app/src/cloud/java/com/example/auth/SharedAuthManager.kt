package com.example.auth

import android.content.Context
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import com.example.R
import com.example.data.ExamCatalog
import com.example.model.SsoSessionInfo
import com.example.model.SubStatus
import com.example.model.UserCentralProfile
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Implements the Shared Authentication and Authorization Model across CertMaster Web Platform and Android.
 * - Uses Jetpack CredentialManager (GetSignInWithGoogleOption & GetGoogleIdOption) + FirebaseAuth
 * - Shares the canonical OIDC client ID and user identity with the Web Platform (src/context/AuthContext.tsx)
 * - Enforces identical per-exam and Universal Multi-Pass entitlement checks across both interfaces
 */
class SharedAuthManager(private val context: Context? = null) {

    private val _ssoSession = MutableStateFlow(SsoSessionInfo())
    val ssoSession: StateFlow<SsoSessionInfo> = _ssoSession.asStateFlow()

    init {
        restorePersistedFirebaseSession()
    }

    /** If Firebase Auth already holds a real signed-in user, reflect it; otherwise stay SIGNED_OUT. */
    private fun restorePersistedFirebaseSession() {
        try {
            if (!isFirebaseInitialized()) return
            val u = FirebaseAuth.getInstance().currentUser ?: return
            installTokenProvider()
            _ssoSession.value = SsoSessionInfo(
                isAuthenticated = true,
                ssoSubjectId = u.uid,
                email = u.email ?: "",
                displayName = u.displayName ?: u.email ?: "",
                emailVerified = u.isEmailVerified,
                sessionStartedAt = System.currentTimeMillis(),
                syncStatus = "LOCAL_ONLY"
            )
        } catch (_: Exception) {
            // Stay signed out.
        }
    }

    companion object {
        const val FIREBASE_PROJECT_ID = "gen-lang-client-0788513176"
        const val FIRESTORE_DATABASE_ID = "ai-studio-certmasterwebpla-ad2ba0f9-3a61-45af-b60a-14f5eb4f6001"
        const val FIREBASE_APP_ID = "1:814967786900:android:5505a40d0c7200a00cd381"
        const val FIREBASE_API_KEY = "AIzaSyDOh5r6vbXc_WVJkrPfHt-ymaa9HMOBtsg"
        const val FIREBASE_STORAGE_BUCKET = "gen-lang-client-0788513176.firebasestorage.app"
        const val GOOGLE_WEB_OAUTH_CLIENT_ID = "814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com"

        fun buildSharedFirebaseOptions(): FirebaseOptions {
            return FirebaseOptions.Builder()
                .setProjectId(FIREBASE_PROJECT_ID)
                .setApplicationId(FIREBASE_APP_ID)
                .setApiKey(FIREBASE_API_KEY)
                .setStorageBucket(FIREBASE_STORAGE_BUCKET)
                .build()
        }

        /**
         * Ensures FirebaseApp is initialized against gen-lang-client-0788513176 even when google-services.json
         * has not yet been placed in apps/android/app/.
         * Skips background Play Services thread initialization when running inside local JVM Robolectric unit tests.
         */
        fun ensureFirebaseAppInitialized(ctx: Context?): Boolean {
            if (ctx == null) return false
            if (android.os.Build.FINGERPRINT.equals("robolectric", ignoreCase = true)) {
                return false
            }
            return try {
                if (FirebaseApp.getApps(ctx).isNotEmpty()) {
                    true
                } else {
                    FirebaseApp.initializeApp(ctx, buildSharedFirebaseOptions())
                    FirebaseApp.getApps(ctx).isNotEmpty()
                }
            } catch (_: Exception) {
                false
            }
        }
    }

    /**
     * Checks if FirebaseApp is initialized in the current runtime environment.
     */
    fun isFirebaseInitialized(): Boolean {
        return ensureFirebaseAppInitialized(context)
    }

    /**
     * Returns the currently authenticated Firebase UID if Firebase Auth is active,
     * or an empty string when signed out (never a hardcoded/demo identity).
     */
    /** Makes API calls carry the signed-in user's Firebase ID token (no embedded secrets). */
    fun installTokenProvider() {
        com.example.network.ApiClient.tokenProvider = {
            try {
                val u = FirebaseAuth.getInstance().currentUser
                if (u == null) null
                else com.google.android.gms.tasks.Tasks.await(u.getIdToken(false)).token
            } catch (_: Exception) {
                null
            }
        }
    }

    fun getActiveUserId(): String {
        if (isFirebaseInitialized()) {
            try {
                val firebaseUser = FirebaseAuth.getInstance().currentUser
                if (firebaseUser != null) {
                    return firebaseUser.uid
                }
            } catch (_: Exception) {
                // Fallback to SSO session subject ID when Firebase is not yet manually configured
            }
        }
        return _ssoSession.value.ssoSubjectId
    }

    /**
     * Explicit Google Sign-In flow via Jetpack Credential Manager (GetSignInWithGoogleOption).
     */
    suspend fun signInWithGoogle(activityContext: Context): Result<SsoSessionInfo> {
        return try {
            val webClientId = activityContext.getString(R.string.default_web_client_id)
            val credentialManager = CredentialManager.create(activityContext)

            val googleSignInOption = GetSignInWithGoogleOption.Builder(webClientId)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleSignInOption)
                .build()

            val result = credentialManager.getCredential(activityContext, request)
            val credential = result.credential

            if (credential is CustomCredential &&
                credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
            ) {
                val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                val idToken = googleIdTokenCredential.idToken

                if (!isFirebaseInitialized()) {
                    return Result.failure(IllegalStateException("Firebase is not initialized; cannot complete sign-in."))
                }
                val firebaseCred = GoogleAuthProvider.getCredential(idToken, null)
                val authResult = FirebaseAuth.getInstance().signInWithCredential(firebaseCred).await()
                val uid = authResult.user?.uid
                    ?: return Result.failure(IllegalStateException("Firebase sign-in returned no user."))
                installTokenProvider()

                val updatedSession = SsoSessionInfo(
                    isAuthenticated = true,
                    provider = "Google Identity Services (OIDC)",
                    issuer = "https://accounts.google.com",
                    clientId = webClientId,
                    ssoSubjectId = uid,
                    email = googleIdTokenCredential.id,
                    displayName = googleIdTokenCredential.displayName ?: googleIdTokenCredential.id,
                    emailVerified = FirebaseAuth.getInstance().currentUser?.isEmailVerified == true,
                    sessionStartedAt = System.currentTimeMillis(),
                    tokenExpiresAt = System.currentTimeMillis() + 86_400_000L,
                    jwtTokenPreview = "",
                    syncStatus = "LOCAL_ONLY"
                )
                _ssoSession.value = updatedSession
                Result.success(updatedSession)
            } else {
                Result.failure(IllegalStateException("Unsupported credential type returned"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Silent credential restoration on launch via GetGoogleIdOption.
     */
    suspend fun attemptSilentSignIn(activityContext: Context): SsoSessionInfo {
        return try {
            val webClientId = activityContext.getString(R.string.default_web_client_id)
            val credentialManager = CredentialManager.create(activityContext)

            val googleIdOption = GetGoogleIdOption.Builder()
                .setServerClientId(webClientId)
                .setFilterByAuthorizedAccounts(true)
                .setAutoSelectEnabled(true)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            val result = credentialManager.getCredential(activityContext, request)
            val credential = result.credential
            if (credential is CustomCredential &&
                credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
            ) {
                val tokenCred = GoogleIdTokenCredential.createFrom(credential.data)
                if (isFirebaseInitialized()) {
                    val firebaseCred = GoogleAuthProvider.getCredential(tokenCred.idToken, null)
                    val res = FirebaseAuth.getInstance().signInWithCredential(firebaseCred).await()
                    installTokenProvider()
                    _ssoSession.value = _ssoSession.value.copy(ssoSubjectId = res.user?.uid ?: "")
                }
                _ssoSession.value = _ssoSession.value.copy(
                    isAuthenticated = _ssoSession.value.ssoSubjectId.isNotEmpty(),
                    email = tokenCred.id,
                    displayName = tokenCred.displayName ?: _ssoSession.value.displayName,
                    syncStatus = "LOCAL_ONLY"
                )
            }
            _ssoSession.value
        } catch (_: Exception) {
            // Keep whatever real session state exists; never fabricate one.
            _ssoSession.value
        }
    }

    /**
     * Signs out from both FirebaseAuth and Jetpack CredentialManager.
     */
    suspend fun signOut(activityContext: Context? = context) {
        try {
            if (isFirebaseInitialized()) {
                FirebaseAuth.getInstance().signOut()
            }
            if (activityContext != null) {
                val credentialManager = CredentialManager.create(activityContext)
                credentialManager.clearCredentialState(ClearCredentialStateRequest())
            }
        } catch (_: Exception) {
            // Ignore cleanup exceptions in non-Play environments
        }
        com.example.network.ApiClient.tokenProvider = null
        _ssoSession.value = SsoSessionInfo()
    }

    /**
     * Refreshes the SSO session handshake and synchronizes token expiration with Web Platform.
     */
    fun refreshSsoSession(email: String = _ssoSession.value.email, displayName: String = _ssoSession.value.displayName) {
        // Never creates a session: only updates display fields of a REAL, already-authenticated session.
        if (!_ssoSession.value.isAuthenticated) return
        _ssoSession.value = _ssoSession.value.copy(
            email = email.ifEmpty { _ssoSession.value.email },
            displayName = displayName.ifEmpty { _ssoSession.value.displayName }
        )
    }

    /** Records the outcome of a real sync attempt: SYNCHRONIZED, SYNC_PENDING or SYNC_FAILED. */
    fun markSyncStatus(status: String) {
        if (!_ssoSession.value.isAuthenticated) return
        _ssoSession.value = _ssoSession.value.copy(syncStatus = status)
    }

    /**
     * Authoritative cross-platform entitlement verification matching Web Platform rules:
     * A student is authorized for an exam if:
     * 1) The specific exam subscription exists and is explicitly ACTIVE or TRIAL_ACTIVE, OR
     * 2) No explicit LOCKED/EXPIRED override exists for that exam and the student holds "Universal Multi-Pass".
     */
    fun isAuthorizedForExam(examId: String, profile: UserCentralProfile): Boolean {
        val matchingSub = profile.subscriptions.firstOrNull {
            ExamCatalog.matchesExamId(it.examId, examId)
        }
        if (matchingSub != null) {
            return matchingSub.status == SubStatus.ACTIVE || matchingSub.status == SubStatus.TRIAL_ACTIVE
        }
        return profile.subscriptionTier == "Universal Multi-Pass"
    }
}
