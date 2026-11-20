package com.example.network

import com.example.model.UserCentralProfile

object BackendRelayClient {
    suspend fun pingAndSync(
        baseUrl: String,
        apiKey: String,
        profile: UserCentralProfile
    ): Boolean = false
}
