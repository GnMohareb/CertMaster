package com.example.network

import com.example.model.UserCentralProfile

object BackendRelayClient {
    suspend fun pingAndSync(
        baseUrl: String,
        apiKey: String,
        profile: UserCentralProfile
    ): Boolean {
        return try {
            val service = ApiClient.createService(baseUrl)
            val authHeader = if (apiKey.isNotEmpty()) "Bearer $apiKey" else null
            val healthResp = service.checkHealth(authHeader)
            val syncResp = service.syncProfile(authHeader, profile)
            healthResp.isSuccessful && syncResp.isSuccessful
        } catch (_: Exception) {
            false
        }
    }
}
