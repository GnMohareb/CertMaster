package com.example.network

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {

    /**
     * Supplies a fresh Firebase ID token for the currently signed-in user, or null when signed out.
     * Set by the app after real Firebase sign-in. There is NO embedded secret and NO fallback identity:
     * requests made while signed out carry no Authorization header and are rejected (401) by the backend.
     */
    @Volatile
    var tokenProvider: (() -> String?)? = null

    @Volatile
    var explicitBearerToken: String? = null

    private val moshi = Moshi.Builder()
        .addLast(KotlinJsonAdapterFactory())
        .build()

    fun createService(baseUrl: String): ExamApiService {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }

        val authInterceptor = Interceptor { chain ->
            val original = chain.request()
            if (original.header("Authorization") != null) {
                chain.proceed(original)
            } else {
                val token = explicitBearerToken ?: runCatching { tokenProvider?.invoke() }.getOrNull()
                if (token.isNullOrBlank()) {
                    chain.proceed(original)
                } else {
                    chain.proceed(original.newBuilder().header("Authorization", "Bearer $token").build())
                }
            }
        }

        val client = OkHttpClient.Builder()
            .connectTimeout(6, TimeUnit.SECONDS)
            .readTimeout(6, TimeUnit.SECONDS)
            .addInterceptor(authInterceptor)
            .addInterceptor(logging)
            .build()

        val cleanBaseUrl = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"

        return Retrofit.Builder()
            .baseUrl(cleanBaseUrl)
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(ExamApiService::class.java)
    }
}
