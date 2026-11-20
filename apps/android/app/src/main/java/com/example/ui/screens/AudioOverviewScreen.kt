package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.FastForward
import androidx.compose.material.icons.filled.FastRewind
import androidx.compose.material.icons.filled.Headphones
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import com.example.ui.components.AudioWaveformVisualizer
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.AccentCyan
import com.example.ui.theme.CscBorder
import com.example.ui.theme.CscCardSurface
import com.example.ui.theme.CscPrimaryBlue
import com.example.ui.theme.CscSelectedBg
import com.example.ui.theme.CscSuccessDark
import com.example.ui.theme.CscTextSecondary
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.SuccessGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AudioOverviewScreen(
    viewModel: ExamViewModel,
    modifier: Modifier = Modifier
) {
    val audio = viewModel.selectedAudio.collectAsState().value
    val isPlaying by viewModel.speechManager.isPlaying.collectAsState()
    val activeTurnIndex by viewModel.speechManager.currentTurnIndex.collectAsState()
    val currentSpeed by viewModel.speechManager.playbackSpeed.collectAsState()
    val playbackError by viewModel.speechManager.playbackError.collectAsState()
    val listState = rememberLazyListState()

    BackHandler {
        viewModel.speechManager.stop()
        viewModel.navigateTo(AppScreen.NOTEBOOK_SOURCES)
    }

    // Auto-scroll list when speech turn advances
    LaunchedEffect(activeTurnIndex) {
        if (audio != null && activeTurnIndex in audio.turns.indices) {
            listState.animateScrollToItem(activeTurnIndex)
        }
    }

    if (audio == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No audio overview selected.")
        }
        return
    }

    val isOfflineCsc = com.example.BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-")
    val host1Color = if (isOfflineCsc) CscPrimaryBlue else AccentBlue
    val host2Color = if (isOfflineCsc) Color(0xFF476C5E) else AccentCyan

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        TopAppBar(
            title = {
                Column {
                    Text(
                        text = if (isOfflineCsc) "Audio Study Briefing" else "NotebookLM Deep Dive",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (isOfflineCsc) "Recorded briefing" else "2-Host AI Conversation",
                        fontSize = if (isOfflineCsc) 12.sp else 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            },
            navigationIcon = {
                IconButton(onClick = {
                    viewModel.speechManager.stop()
                    viewModel.navigateTo(AppScreen.NOTEBOOK_SOURCES)
                }) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
        )
        if (isOfflineCsc) {
            HorizontalDivider(thickness = 1.dp, color = CscBorder)
        }

        // Player Hero Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(if (isOfflineCsc) 16.dp else 20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
            elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 3.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Host avatars badge
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(host1Color),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("AL", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                    if (audio.host2.isNotBlank()) {
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("&", fontWeight = FontWeight.Bold, color = if (isOfflineCsc) CscTextSecondary else Slate400)
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(host2Color),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("MY", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = audio.title,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    lineHeight = 23.sp
                )

                Text(
                    text = if (audio.host2.isBlank()) audio.host1 else "${audio.host1} & ${audio.host2}",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Sound Waveform animation
                AudioWaveformVisualizer(
                    isPlaying = isPlaying,
                    modifier = Modifier.padding(vertical = 4.dp)
                )

                Spacer(modifier = Modifier.height(14.dp))

                playbackError?.let { message ->
                    Text(text = message, color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                }

                // Media Controls (Rewind, Play/Pause, Forward, Speed)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Speed multiplier toggle
                    OutlinedButton(
                        onClick = {
                            val newSpeed = when (currentSpeed) {
                                1.0f -> 1.25f
                                1.25f -> 1.5f
                                else -> 1.0f
                            }
                            viewModel.speechManager.setSpeed(newSpeed)
                        },
                        shape = RoundedCornerShape(20.dp),
                        border = BorderStroke(1.dp, if (isOfflineCsc) CscBorder else MaterialTheme.colorScheme.outline),
                        colors = if (isOfflineCsc) {
                            ButtonDefaults.outlinedButtonColors(
                                containerColor = CscCardSurface,
                                contentColor = CscPrimaryBlue
                            )
                        } else {
                            ButtonDefaults.outlinedButtonColors()
                        },
                        modifier = Modifier.heightIn(min = 48.dp),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("${currentSpeed}x", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }

                    // Prev Turn
                    IconButton(
                        onClick = {
                            val prev = (activeTurnIndex - 1).coerceAtLeast(0)
                            viewModel.playAudioTurn(prev)
                        },
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(Icons.Default.FastRewind, contentDescription = "Previous", modifier = Modifier.size(28.dp))
                    }

                    // Play/Pause FAB
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primary)
                            .clickable {
                                if (isPlaying) {
                                    viewModel.speechManager.pause()
                                } else if (audio.turns.isNotEmpty()) {
                                    viewModel.playAudioTurn(activeTurnIndex.coerceIn(0, audio.turns.size - 1))
                                }
                            }
                            .testTag("audio_play_pause_button"),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = if (isPlaying) "Pause" else "Play",
                            tint = Color.White,
                            modifier = Modifier.size(34.dp)
                        )
                    }

                    // Next Turn
                    IconButton(
                        onClick = {
                            if (audio.turns.isNotEmpty()) {
                                val next = (activeTurnIndex + 1).coerceAtMost(audio.turns.size - 1)
                                viewModel.playAudioTurn(next)
                            }
                        },
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(Icons.Default.FastForward, contentDescription = "Next", modifier = Modifier.size(28.dp))
                    }

                    if (!isOfflineCsc) {
                        // Ask AI about this overview
                        IconButton(
                            onClick = {
                                viewModel.speechManager.stop()
                                viewModel.sendAIPrompt("I listened to the NotebookLM deep dive on '${audio.title}'. Can you summarize the 3 highest yield takeaways?")
                                viewModel.navigateTo(AppScreen.AI_TUTOR)
                            }
                        ) {
                            Icon(Icons.Default.Psychology, contentDescription = "Ask AI", tint = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }
        }

        // Live Transcript List with Tap-to-Speak
        Text(
            text = "Interactive Transcript (Tap turn to listen)",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 6.dp)
        )

        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            itemsIndexed(audio.turns) { index, turn ->
                val isActive = index == activeTurnIndex
                val isHost1 = turn.speaker.contains("Alex")
                val speakerColor = if (isHost1) host1Color else host2Color

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .clickable { viewModel.playAudioTurn(index) },
                    shape = RoundedCornerShape(14.dp),
                    border = BorderStroke(
                        width = if (isActive) 2.dp else if (isOfflineCsc) 1.dp else 0.dp,
                        color = if (isActive) {
                            MaterialTheme.colorScheme.primary
                        } else if (isOfflineCsc) {
                            CscBorder
                        } else {
                            Color.Transparent
                        }
                    ),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isActive) {
                            if (isOfflineCsc) CscSelectedBg else MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                        } else {
                            MaterialTheme.colorScheme.surface
                        }
                    ),
                    elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else if (isActive) 2.dp else 0.5.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(22.dp)
                                        .clip(CircleShape)
                                        .background(speakerColor),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = if (isHost1) "A" else "M",
                                        color = Color.White,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = turn.speaker,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = speakerColor
                                )
                            }

                            if (isActive && isPlaying) {
                                Text(
                                    text = "SPEAKING",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = if (isOfflineCsc) CscSuccessDark else SuccessGreen
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = turn.text,
                            fontSize = if (isOfflineCsc) 14.sp else 13.sp,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = if (isOfflineCsc) 21.sp else 19.sp
                        )
                    }
                }
            }
        }
    }
}
