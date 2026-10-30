package com.example.network

import com.example.model.AudioOverview
import com.example.model.ExamConfig
import com.example.model.ExamSession
import com.example.model.Flashcard
import com.example.model.Question
import com.example.model.SourceDoc
import com.example.model.UserCentralProfile
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path

interface ExamApiService {

    @GET("health")
    suspend fun checkHealth(
        @Header("Authorization") authHeader: String?
    ): Response<Map<String, Any>>

    @GET("catalog")
    suspend fun getCatalog(
        @Header("Authorization") authHeader: String?
    ): Response<List<ExamConfig>>

    @GET("exams/{examId}/config")
    suspend fun getExamConfig(
        @Path("examId") examId: String,
        @Header("Authorization") authHeader: String?
    ): Response<ExamConfig>

    @GET("exams/{examId}/questions")
    suspend fun getQuestions(
        @Path("examId") examId: String,
        @Header("Authorization") authHeader: String?
    ): Response<List<Question>>

    @GET("exams/{examId}/sources")
    suspend fun getSources(
        @Path("examId") examId: String,
        @Header("Authorization") authHeader: String?
    ): Response<List<SourceDoc>>

    @GET("exams/{examId}/audio-overviews")
    suspend fun getAudioOverviews(
        @Path("examId") examId: String,
        @Header("Authorization") authHeader: String?
    ): Response<List<AudioOverview>>

    @GET("exams/{examId}/flashcards")
    suspend fun getFlashcards(
        @Path("examId") examId: String,
        @Header("Authorization") authHeader: String?
    ): Response<List<Flashcard>>

    @POST("exams/{examId}/sessions")
    suspend fun submitSessionTelemetry(
        @Path("examId") examId: String,
        @Header("Authorization") authHeader: String?,
        @Body session: ExamSession
    ): Response<Map<String, Any>>

    // Central Web Platform Cloud Sync Endpoints (shared with src/services/apiSyncService.ts)
    @POST("api/profile/sync")
    suspend fun syncProfile(
        @Header("Authorization") authHeader: String?,
        @Body profile: UserCentralProfile
    ): Response<Map<String, Any>>

    @POST("api/subscriptions/verify")
    suspend fun verifySubscription(
        @Header("Authorization") authHeader: String?,
        @Body request: Map<String, String>
    ): Response<Map<String, Any>>

    @POST("api/scores/telemetry")
    suspend fun sendScoreTelemetry(
        @Header("Authorization") authHeader: String?,
        @Body telemetry: Map<String, Any>
    ): Response<Map<String, Any>>

    @POST("api/study-plan/sync")
    suspend fun syncStudyPlan(
        @Header("Authorization") authHeader: String?,
        @Body studyPlanPayload: Map<String, Any>
    ): Response<Map<String, Any>>

    @POST("api/flashcards/sync")
    suspend fun syncFlashcards(
        @Header("Authorization") authHeader: String?,
        @Body flashcardsPayload: Map<String, Any>
    ): Response<Map<String, Any>>
}
