package com.example.model

data class BackendConfig(
    val baseUrl: String = "https://api.myexambanks.com/v1",
    val apiKey: String = "",
    val autoSyncOnLaunch: Boolean = true,
    val isOnline: Boolean = true,
    val isConnected: Boolean = true,
    val lastSyncMillis: Long? = null,
    val activeExamId: String = "cissp"
)
