package com.example.ui.screens

import androidx.activity.compose.BackHandler
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

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        TopAppBar(
            title = {
                Column {
                    Text(
                        text = "NotebookLM Deep Dive",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "2-Host AI Conversation",
                        fontSize = 11.sp,
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

        // Player Hero Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(3.dp)
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
                            .background(AccentBlue),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("AL", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("&", fontWeight = FontWeight.Bold, color = Slate400)
                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(AccentCyan),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("MY", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = audio.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    lineHeight = 22.sp
                )

                Text(
                    text = "${audio.host1} & ${audio.host2}",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Sound Waveform animation
                AudioWaveformVisualizer(
                    isPlaying = isPlaying,
                    modifier = Modifier.padding(vertical = 4.dp)
                )

                Spacer(modifier = Modifier.height(14.dp))

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
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text("${currentSpeed}x", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    // Prev Turn
                    IconButton(
                        onClick = {
                            val prev = (activeTurnIndex - 1).coerceAtLeast(0)
                            viewModel.playAudioTurn(prev)
                        }
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
                                } else {
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
                            val next = (activeTurnIndex + 1).coerceAtMost(audio.turns.size - 1)
                            viewModel.playAudioTurn(next)
                        }
                    ) {
                        Icon(Icons.Default.FastForward, contentDescription = "Next", modifier = Modifier.size(28.dp))
                    }

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

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .clickable { viewModel.playAudioTurn(index) }
                        .border(
                            width = if (isActive) 2.dp else 0.dp,
                            color = if (isActive) MaterialTheme.colorScheme.primary else Color.Transparent,
                            shape = RoundedCornerShape(14.dp)
                        ),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isActive) {
                            MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                        } else {
                            MaterialTheme.colorScheme.surface
                        }
                    ),
                    elevation = CardDefaults.cardElevation(if (isActive) 2.dp else 0.5.dp)
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
                                        .size(20.dp)
                                        .clip(CircleShape)
                                        .background(if (isHost1) AccentBlue else AccentCyan),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = if (isHost1) "A" else "M",
                                        color = Color.White,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = turn.speaker,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isHost1) AccentBlue else AccentCyan
                                )
                            }

                            if (isActive && isPlaying) {
                                Text(
                                    text = "SPEAKING",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = SuccessGreen
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = turn.text,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = 19.sp
                        )
                    }
                }
            }
        }
    }
}
