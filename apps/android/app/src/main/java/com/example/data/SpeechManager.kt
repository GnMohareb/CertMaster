package com.example.data

import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale

class SpeechManager(context: Context) {

    private var tts: TextToSpeech? = null
    private var isInitialized = false

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentTurnIndex = MutableStateFlow(0)
    val currentTurnIndex: StateFlow<Int> = _currentTurnIndex.asStateFlow()

    private val _playbackSpeed = MutableStateFlow(1.0f)
    val playbackSpeed: StateFlow<Float> = _playbackSpeed.asStateFlow()

    init {
        tts = TextToSpeech(context.applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts?.language = Locale.US
                isInitialized = true
            }
        }

        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {
                _isPlaying.value = true
            }

            override fun onDone(utteranceId: String?) {
                // If it's a turn utterance, we can advance
                val index = utteranceId?.substringAfter("turn_", "")?.toIntOrNull()
                if (index != null) {
                    _currentTurnIndex.value = index + 1
                }
            }

            override fun onError(utteranceId: String?) {
                _isPlaying.value = false
            }
        })
    }

    fun speakTurn(text: String, turnIndex: Int, isHostFemale: Boolean = false) {
        if (!isInitialized) return
        _currentTurnIndex.value = turnIndex
        tts?.setSpeechRate(_playbackSpeed.value)
        tts?.setPitch(if (isHostFemale) 1.25f else 0.95f)
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "turn_$turnIndex")
        _isPlaying.value = true
    }

    fun setSpeed(speed: Float) {
        _playbackSpeed.value = speed
        tts?.setSpeechRate(speed)
    }

    fun pause() {
        tts?.stop()
        _isPlaying.value = false
    }

    fun stop() {
        tts?.stop()
        _isPlaying.value = false
        _currentTurnIndex.value = 0
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
    }
}
