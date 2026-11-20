package com.example.data

import android.content.Context
import android.media.MediaPlayer
import java.io.IOException
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale

class SpeechManager(context: Context, enableTextToSpeech: Boolean = true) {

    private val assets = context.applicationContext.assets
    private var recordingPlayer: MediaPlayer? = null
    private var recordingAssets = emptyList<String>()
    private val _playbackError = MutableStateFlow<String?>(null)
    val playbackError: StateFlow<String?> = _playbackError.asStateFlow()

    private var tts: TextToSpeech? = null
    private var isInitialized = false

    private val _isPlaying = MutableStateFlow(false)
    val isPlaying: StateFlow<Boolean> = _isPlaying.asStateFlow()

    private val _currentTurnIndex = MutableStateFlow(0)
    val currentTurnIndex: StateFlow<Int> = _currentTurnIndex.asStateFlow()

    private val _playbackSpeed = MutableStateFlow(1.0f)
    val playbackSpeed: StateFlow<Float> = _playbackSpeed.asStateFlow()

    init {
        if (enableTextToSpeech) tts = TextToSpeech(context.applicationContext) { status ->
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

    fun playRecording(paths: List<String>, turnIndex: Int) {
        if (turnIndex !in paths.indices) return
        _playbackError.value = null
        val existing = recordingPlayer
        if (existing != null && recordingAssets == paths && _currentTurnIndex.value == turnIndex) {
            startRecording(existing)
            return
        }

        releaseRecording()
        recordingAssets = paths
        _currentTurnIndex.value = turnIndex
        val player = MediaPlayer()
        recordingPlayer = player
        try {
            assets.openFd(paths[turnIndex]).use { asset ->
                player.setDataSource(asset.fileDescriptor, asset.startOffset, asset.length)
            }
            player.setOnCompletionListener {
                if (recordingPlayer !== it) return@setOnCompletionListener
                releaseRecording()
                if (turnIndex + 1 < paths.size) playRecording(paths, turnIndex + 1)
            }
            player.setOnErrorListener { failed, _, _ ->
                if (recordingPlayer === failed) reportRecordingError()
                true
            }
            player.prepare()
            startRecording(player)
        } catch (_: IOException) {
            reportRecordingError()
        } catch (_: IllegalStateException) {
            reportRecordingError()
        }
    }

    private fun startRecording(player: MediaPlayer) {
        try {
            player.playbackParams = player.playbackParams.setSpeed(_playbackSpeed.value)
            player.start()
            _isPlaying.value = true
        } catch (_: IllegalStateException) {
            reportRecordingError()
        }
    }

    private fun reportRecordingError() {
        releaseRecording()
        _playbackError.value = "This recording couldn’t play. The transcript is available below."
    }

    private fun releaseRecording() {
        val player = recordingPlayer
        recordingPlayer = null
        player?.release()
        _isPlaying.value = false
    }

    fun setSpeed(speed: Float) {
        _playbackSpeed.value = speed
        tts?.setSpeechRate(speed)
        if (_isPlaying.value) recordingPlayer?.let(::startRecording)
    }

    fun pause() {
        recordingPlayer?.pause()
        tts?.stop()
        _isPlaying.value = false
    }

    fun stop() {
        releaseRecording()
        _playbackError.value = null
        tts?.stop()
        _isPlaying.value = false
        _currentTurnIndex.value = 0
    }

    fun shutdown() {
        releaseRecording()
        tts?.stop()
        tts?.shutdown()
    }
}
