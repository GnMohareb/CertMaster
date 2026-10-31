package com.example.network

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

object ApiClient {

    private const val AUTH_SIGNING_SECRET = "certmaster-dev-hmac-auth-secret-2026-v2"

    @Volatile
    var activeUserId: String = "usr_gnmohareb_cissp_001"

    @Volatile
    var explicitBearerToken: String? = null

    fun createSignedBearerToken(uid: String, expiresInSeconds: Long = 3600L): String {
        val cleanUid = uid.trim().ifEmpty { "usr_gnmohareb_cissp_001" }
        val exp = (System.currentTimeMillis() / 1000L) + expiresInSeconds
        val payload = "$cleanUid.$exp"
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(AUTH_SIGNING_SECRET.toByteArray(Charsets.UTF_8), "HmacSHA256"))
        val sigBytes = mac.doFinal(payload.toByteArray(Charsets.UTF_8))
        val sigHex = sigBytes.joinToString("") { "%02x".format(it) }
        return "cm_auth.$payload.$sigHex"
    }

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
                val token = explicitBearerToken ?: createSignedBearerToken(activeUserId)
                val authed = original.newBuilder()
                    .header("Authorization", "Bearer $token")
                    .build()
                chain.proceed(authed)
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
