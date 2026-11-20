package com.example.auth

import android.content.Context
import com.example.model.SsoSessionInfo
import com.example.model.UserCentralProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Offline-only SharedAuthManager for standalone offline builds.
 * Contains zero Firebase, Google Identity, or Credential Manager dependencies.
 */
class SharedAuthManager(private val context: Context? = null) {

    private val _ssoSession = MutableStateFlow(SsoSessionInfo())
    val ssoSession: StateFlow<SsoSessionInfo> = _ssoSession.asStateFlow()

    companion object {
        const val FIREBASE_PROJECT_ID = ""
        const val FIRESTORE_DATABASE_ID = ""
        const val FIREBASE_APP_ID = ""
        const val FIREBASE_API_KEY = ""
        const val FIREBASE_STORAGE_BUCKET = ""
        const val GOOGLE_WEB_OAUTH_CLIENT_ID = ""

        fun ensureFirebaseAppInitialized(ctx: Context?): Boolean = false
    }

    fun isFirebaseInitialized(): Boolean = false

    fun installTokenProvider() {
        // No-op in standalone offline build.
    }

    fun getActiveUserId(): String = ""

    suspend fun signInWithGoogle(activityContext: Context): Result<SsoSessionInfo> {
        return Result.failure(IllegalStateException("Cloud sign-in is disabled in the standalone offline edition."))
    }

    suspend fun attemptSilentSignIn(activityContext: Context): SsoSessionInfo {
        return _ssoSession.value
    }

    suspend fun signOut(activityContext: Context? = context) {
        _ssoSession.value = SsoSessionInfo()
    }

    fun refreshSsoSession(email: String = _ssoSession.value.email, displayName: String = _ssoSession.value.displayName) {
        // No cloud SSO session in offline build.
    }

    fun markSyncStatus(status: String) {
        // No cloud sync in offline build.
    }

    fun isAuthorizedForExam(examId: String, profile: UserCentralProfile): Boolean {
        return examId.startsWith("csc-part-")
    }
}
