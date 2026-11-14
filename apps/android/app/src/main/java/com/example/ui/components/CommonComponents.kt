package com.example.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ExamConfig
import com.example.ui.AppScreen
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.AccentCyan
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.GoldMastery
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate800
import com.example.ui.theme.Slate900
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WarningAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CertTopAppBar(
    currentExam: ExamConfig,
    isOnline: Boolean,
    onSwitchExam: () -> Unit,
    onOpenWebPortal: () -> Unit = {},
    onOpenSettings: () -> Unit,
    onOpenProfile: () -> Unit = {},
    offlineMode: Boolean = false
) {
    var showOverflowMenu by remember { mutableStateOf(false) }

    TopAppBar(
        title = {
            Column(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .clickable(enabled = !offlineMode) { onSwitchExam() }
                    .padding(vertical = 2.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = currentExam.shortCode,
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(currentExam.primaryColorHex).copy(alpha = 0.15f))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "PASS ${currentExam.passingScorePercent}%",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(currentExam.primaryColorHex)
                        )
                    }
                }
                Text(
                    text = if (offlineMode) "${currentExam.issuer} • Offline edition" else "${currentExam.issuer} • Tap to switch",
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        actions = {
            // Online status indicator
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (isOnline) SuccessGreen.copy(alpha = 0.15f) else Slate400.copy(alpha = 0.15f))
                    .clickable(enabled = !offlineMode) { onOpenProfile() }
                    .padding(horizontal = 7.dp, vertical = 4.dp)
            ) {
                Icon(
                    imageVector = if (isOnline) Icons.Default.CloudDone else Icons.Default.CloudOff,
                    contentDescription = if (isOnline) "Backend Synced" else "Offline",
                    tint = if (isOnline) SuccessGreen else Slate600,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(3.dp))
                Text(
                    text = if (isOnline) "Synced" else "Local",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isOnline) SuccessGreen else Slate600
                )
            }

            // Switch Exam Bank
            if (!offlineMode) IconButton(
                onClick = onSwitchExam,
                modifier = Modifier.testTag("switch_exam_button")
            ) {
                Icon(
                    imageVector = Icons.Default.SwapHoriz,
                    contentDescription = "Switch Exam Bank",
                    tint = MaterialTheme.colorScheme.primary
                )
            }

            // Central Profile
            if (!offlineMode) IconButton(
                onClick = onOpenProfile,
                modifier = Modifier.testTag("open_profile_button")
            ) {
                Icon(
                    imageVector = Icons.Default.AccountCircle,
                    contentDescription = "Central Profile & Subscriptions",
                    tint = MaterialTheme.colorScheme.primary
                )
            }

            // Hide cloud-only menu for standalone offline CSC.
            if (!offlineMode) Box {
                IconButton(
                    onClick = { showOverflowMenu = true }
                ) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = "More Options",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                DropdownMenu(
                    expanded = showOverflowMenu,
                    onDismissRequest = { showOverflowMenu = false }
                ) {
                    DropdownMenuItem(
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Language, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("CertMaster Web Hub")
                            }
                        },
                        onClick = {
                            showOverflowMenu = false
                            onOpenWebPortal()
                        },
                        modifier = Modifier.testTag("open_web_hub_button")
                    )

                    DropdownMenuItem(
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Settings, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Backend Settings & Sync")
                            }
                        },
                        onClick = {
                            showOverflowMenu = false
                            onOpenSettings()
                        },
                        modifier = Modifier.testTag("open_settings_button")
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    )
}

@Composable
fun CertBottomNav(
    currentScreen: AppScreen,
    onNavigate: (AppScreen) -> Unit,
    offlineMode: Boolean = false
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 6.dp
    ) {
        NavigationBarItem(
            selected = currentScreen == AppScreen.DASHBOARD,
            onClick = { onNavigate(AppScreen.DASHBOARD) },
            icon = { Icon(Icons.Default.Assessment, contentDescription = "Dashboard") },
            label = { Text("Dashboard", fontSize = 11.sp, maxLines = 1) },
            alwaysShowLabel = true,
            modifier = Modifier.testTag("nav_metrics")
        )
        NavigationBarItem(
            selected = currentScreen == AppScreen.EXAM_HUB,
            onClick = { onNavigate(AppScreen.EXAM_HUB) },
            icon = { Icon(Icons.Default.MenuBook, contentDescription = "Practice & Exams") },
            label = { Text("Exams", fontSize = 11.sp, maxLines = 1) },
            alwaysShowLabel = true,
            modifier = Modifier.testTag("nav_exams")
        )
        NavigationBarItem(
            selected = currentScreen == AppScreen.NOTEBOOK_SOURCES || currentScreen == AppScreen.AUDIO_OVERVIEW || currentScreen == AppScreen.FLASHCARDS,
            onClick = { onNavigate(AppScreen.NOTEBOOK_SOURCES) },
            icon = {
                Icon(Icons.Default.MenuBook, contentDescription = "Study Notes & Flashcards")
            },
            label = { Text("Study", fontSize = 11.sp, maxLines = 1) },
            alwaysShowLabel = true,
            modifier = Modifier.testTag("nav_notebook")
        )
        if (!offlineMode) NavigationBarItem(
            selected = currentScreen == AppScreen.WEB_PORTAL,
            onClick = { onNavigate(AppScreen.WEB_PORTAL) },
            icon = {
                BadgedBox(badge = { Badge(containerColor = AccentCyan) { Text("WEB", color = Slate900, fontWeight = FontWeight.Bold, fontSize = 9.sp) } }) {
                    Icon(Icons.Default.Language, contentDescription = "Live Web Hub", tint = if (currentScreen == AppScreen.WEB_PORTAL) AccentCyan else MaterialTheme.colorScheme.onSurfaceVariant)
                }
            },
            label = { Text("Web Hub", fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1) },
            alwaysShowLabel = true,
            modifier = Modifier.testTag("nav_web_hub")
        )
        if (!offlineMode) NavigationBarItem(
            selected = currentScreen == AppScreen.AI_TUTOR,
            onClick = { onNavigate(AppScreen.AI_TUTOR) },
            icon = { Icon(Icons.Default.Psychology, contentDescription = "AI Tutor") },
            label = { Text("AI Tutor", fontSize = 11.sp, maxLines = 1) },
            alwaysShowLabel = true,
            modifier = Modifier.testTag("nav_ai_tutor")
        )
    }
}

@Composable
fun ReadinessScoreGauge(
    readinessScore: Int,
    targetScore: Int = 70,
    modifier: Modifier = Modifier
) {
    val progress = (readinessScore / 100f).coerceIn(0f, 1f)
    val gaugeColor = when {
        readinessScore >= targetScore -> SuccessGreen
        readinessScore >= 60 -> WarningAmber
        else -> ErrorRed
    }

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "EXAM READINESS SCORE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = "$readinessScore%",
                        fontSize = 36.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = gaugeColor
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (readinessScore >= targetScore) "Target Met (Pass Prob. High)" else "Need +${targetScore - readinessScore}% to pass",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(bottom = 6.dp)
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = gaugeColor,
                    trackColor = MaterialTheme.colorScheme.surface
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Visual circular badge
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(gaugeColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (readinessScore >= targetScore) "READY" else "PREP",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = gaugeColor
                )
            }
        }
    }
}

@Composable
fun AudioWaveformVisualizer(
    isPlaying: Boolean,
    modifier: Modifier = Modifier
) {
    val transition = rememberInfiniteTransition(label = "waveform")
    val anim1 by transition.animateFloat(
        initialValue = 0.2f,
        targetValue = 0.95f,
        animationSpec = infiniteRepeatable(tween(450, easing = FastOutSlowInEasing), RepeatMode.Reverse),
        label = "bar1"
    )
    val anim2 by transition.animateFloat(
        initialValue = 0.8f,
        targetValue = 0.25f,
        animationSpec = infiniteRepeatable(tween(550, easing = FastOutSlowInEasing), RepeatMode.Reverse),
        label = "bar2"
    )
    val anim3 by transition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(tween(350, easing = FastOutSlowInEasing), RepeatMode.Reverse),
        label = "bar3"
    )

    Row(
        modifier = modifier.height(28.dp),
        horizontalArrangement = Arrangement.spacedBy(3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        val bars = listOf(anim1, anim2, anim3, anim2, anim1, anim3, anim2, anim1)
        bars.forEach { factor ->
            val heightFraction = if (isPlaying) factor else 0.2f
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .height((24 * heightFraction).dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(AccentCyan)
            )
        }
    }
}
