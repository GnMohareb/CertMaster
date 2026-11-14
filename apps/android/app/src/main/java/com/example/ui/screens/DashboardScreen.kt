package com.example.ui.screens

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ExamMode
import com.example.model.StressLevel
import com.example.model.SubStatus
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import com.example.ui.components.PerformanceLineChart
import com.example.ui.components.ReadinessScoreGauge
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.AccentCyan
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.GoldMastery
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate800
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WarningAmber
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun DashboardScreen(
    viewModel: ExamViewModel,
    modifier: Modifier = Modifier
) {
    val currentExam by viewModel.currentExam.collectAsState()
    val sessions by viewModel.sessions.collectAsState()
    val simulationScores by viewModel.simulationScores.collectAsState()
    val userProfile by viewModel.userProfile.collectAsState()
    val ssoSession by viewModel.ssoSession.collectAsState()
    val readinessReport by viewModel.readinessReport.collectAsState()
    val stressMetrics by viewModel.domainStressMetrics.collectAsState()
    val highestStress by viewModel.highestStressDomain.collectAsState()

    // 0: Score Trajectory & Line Chart, 1: Readiness & Domain Mastery, 2: User Behavior & Stress Telemetry
    var dashboardTab by remember { mutableIntStateOf(0) }

    // Overall readiness from AuthoritativeMetricsEngine (60% simulation + 25% calibration + 15% flashcards)
    val readiness = readinessReport.readinessPercent

    val allDomainScores = sessions.flatMap { it.domainScores }
    val domainPerformanceMap = allDomainScores.groupBy { it.domainId }.mapValues { (_, list) ->
        list.map { it.percentage }.average().toInt()
    }

    // Active subscription status for current exam
    val currentExamSub = userProfile.subscriptions.firstOrNull { it.examId == currentExam.id }
    val isExamSubscribed = currentExamSub?.status == SubStatus.ACTIVE
    val isOfflineCsc = currentExam.shortCode.contains("CSC", ignoreCase = true)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Top Central Profile & Subscription Status Strip
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                .clickable(enabled = !isOfflineCsc) { viewModel.navigateTo(AppScreen.CENTRAL_PROFILE) }
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(16.dp)
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isOfflineCsc) "CSC Part 1 • Offline study" else if (ssoSession.isAuthenticated) "${userProfile.displayName.ifEmpty { ssoSession.email }} • ${if (isExamSubscribed) "Access Active" else "No active pass"}" else "Not signed in • Local only (tap to sign in)",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (isExamSubscribed) SuccessGreen.copy(alpha = 0.15f) else WarningAmber.copy(alpha = 0.15f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = if (isOfflineCsc) "OFFLINE" else if (!ssoSession.isAuthenticated) "LOCAL ONLY" else if (isExamSubscribed) "ACTIVE" else "MANAGE PASS",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isExamSubscribed) SuccessGreen else WarningAmber
                    )
                }
            }
        }

        // Top Navigation Tabs
        TabRow(
            selectedTabIndex = dashboardTab,
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.primary
        ) {
            Tab(
                selected = dashboardTab == 0,
                onClick = { dashboardTab = 0 },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.TrendingUp, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Score Trends", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                },
                modifier = Modifier.testTag("tab_score_trends")
            )
            Tab(
                selected = dashboardTab == 1,
                onClick = { dashboardTab = 1 },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Assessment, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Readiness", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                },
                modifier = Modifier.testTag("tab_readiness_mastery")
            )
            Tab(
                selected = dashboardTab == 2,
                onClick = { dashboardTab = 2 },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Speed, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Behavior & Stress", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                },
                modifier = Modifier.testTag("tab_behavior_telemetry")
            )
        }

        when (dashboardTab) {
            // TAB 0: PERFORMANCE LINE CHART & SCORE TRAJECTORY (REQUESTED CORE DASHBOARD)
            0 -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    contentPadding = PaddingValues(top = 14.dp, bottom = 28.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Line Chart Component (Observes Room SQLite)
                    item {
                        PerformanceLineChart(
                            scores = simulationScores,
                            currentExam = currentExam,
                            modifier = Modifier.testTag("performance_line_chart")
                        )
                    }

                    // Hide cloud marketing and portal navigation for standalone CSC.
                    if (!isOfflineCsc) item {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("card_web_companion_hub"),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Slate800)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Box(
                                            modifier = Modifier
                                                .size(36.dp)
                                                .clip(CircleShape)
                                                .background(AccentCyan.copy(alpha = 0.15f)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Language,
                                                contentDescription = null,
                                                tint = AccentCyan,
                                                modifier = Modifier.size(20.dp)
                                            )
                                        }
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Column {
                                            Text(
                                                text = "Central Web Platform",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp,
                                                color = Color.White
                                            )
                                            Text(
                                                text = "112 Exam Banks • Live Cloud Node",
                                                fontSize = 11.sp,
                                                color = Slate400
                                            )
                                        }
                                    }

                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(SuccessGreen.copy(alpha = 0.15f))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = "ONLINE",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = SuccessGreen
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))
                                Text(
                                    text = "Access the companion cloud portal with real-time synchronized account state, universal multi-pass subscriptions, and side-by-side Dual Device Studio.",
                                    fontSize = 12.sp,
                                    color = Slate400
                                )

                                Spacer(modifier = Modifier.height(12.dp))
                                Button(
                                    onClick = { viewModel.navigateTo(AppScreen.WEB_PORTAL) },
                                    colors = ButtonDefaults.buttonColors(containerColor = AccentBlue),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("btn_open_web_portal_dash")
                                ) {
                                    Icon(Icons.Default.Language, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Open Live Web Portal", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                        }
                    }

                    // Simulation Action CTAs (Hero Practice Actions)
                    if (!isOfflineCsc) item {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("card_quick_study_actions"),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = if (isExamSubscribed) "Complete ${currentExam.shortCode} Prep Active" else "Free 50-Question Assessment",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = if (isExamSubscribed)
                                        "Unlimited simulation exams, full question bank, and AI tutor are fully unlocked."
                                    else
                                        "Diagnose your readiness across all ${currentExam.domains.size} domains. Take 50 questions free, then upgrade to unlock complete exams.",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Button(
                                        onClick = {
                                            if (isExamSubscribed) viewModel.startSimulation(ExamMode.FULL_SIMULATION)
                                            else viewModel.startAssessmentExam()
                                        },
                                        modifier = Modifier
                                            .weight(1f)
                                            .testTag("btn_launch_simulation_chart"),
                                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                                    ) {
                                        Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(if (isExamSubscribed) "Start Exam" else "Free 50-Q Test", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }

                                    OutlinedButton(
                                        onClick = {
                                            if (isExamSubscribed) viewModel.startAssessmentExam()
                                            else viewModel.navigateTo(AppScreen.CENTRAL_PROFILE)
                                        },
                                        modifier = Modifier
                                            .weight(1f)
                                            .testTag("btn_launch_assessment_chart")
                                    ) {
                                        Icon(
                                            if (isExamSubscribed) Icons.Default.Psychology else Icons.Default.AutoAwesome,
                                            contentDescription = null,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(if (isExamSubscribed) "Diagnostic Drill" else "Upgrade Pass", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }

                    // Historical Simulation Attempt Log
                    item {
                        Text(
                            text = if (simulationScores.isEmpty()) "Recent Simulation History (0 Attempts Recorded)" else "Recent Simulation History (${simulationScores.size} Attempts)",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }

                    items(simulationScores.asReversed()) { attempt ->
                        val isPassed = attempt.isPassed
                        val badgeColor = if (isPassed) SuccessGreen else ErrorRed
                        val domainBreakdown = attempt.parseDomainScores()

                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(1.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Box(
                                            modifier = Modifier
                                                .size(32.dp)
                                                .clip(CircleShape)
                                                .background(badgeColor.copy(alpha = 0.15f)),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "#${attempt.attemptNumber}",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = badgeColor
                                            )
                                        }
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Column {
                                            Text(
                                                text = "Simulation Run #${attempt.attemptNumber}",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 13.sp
                                            )
                                            Text(
                                                text = SimpleDateFormat("MMM d, yyyy • h:mm a", Locale.getDefault()).format(Date(attempt.timestampMillis)),
                                                fontSize = 11.sp,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }

                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = "${attempt.overallScorePercent}%",
                                            fontWeight = FontWeight.ExtraBold,
                                            fontSize = 16.sp,
                                            color = badgeColor
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(badgeColor.copy(alpha = 0.15f))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = if (isPassed) "PASS" else "FAIL",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = badgeColor
                                            )
                                        }
                                    }
                                }

                                if (domainBreakdown.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        domainBreakdown.take(4).forEach { dRec ->
                                            val dPassing = dRec.scorePercent >= currentExam.passingScorePercent
                                            Box(
                                                modifier = Modifier
                                                    .weight(1f)
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                                    .padding(horizontal = 4.dp, vertical = 4.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                    Text(dRec.domainId.uppercase(), fontSize = 9.sp, color = Slate400)
                                                    Text(
                                                        "${dRec.scorePercent}%",
                                                        fontSize = 11.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = if (dPassing) SuccessGreen else WarningAmber
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // TAB 1: READINESS & DOMAIN MASTERY
            1 -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    contentPadding = PaddingValues(top = 14.dp, bottom = 28.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Hero Exam Info
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(18.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(2.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        Brush.linearGradient(
                                            listOf(Color(currentExam.primaryColorHex).copy(alpha = 0.12f), Color.Transparent)
                                        )
                                    )
                                    .padding(16.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(Color(currentExam.primaryColorHex))
                                            .padding(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                        Text(currentExam.shortCode, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                    }
                                    Text("${currentExam.domains.size} Domains", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(currentExam.title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                Text(currentExam.description, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, lineHeight = 16.sp)
                            }
                        }
                    }

                    // Readiness Gauge
                    item {
                        ReadinessScoreGauge(
                            readinessScore = readiness,
                            targetScore = currentExam.passingScorePercent,
                            modifier = Modifier.testTag("readiness_gauge")
                        )
                    }

                    // Behavior Alert Callout Banner
                    if (highestStress != null) {
                        val stressed = highestStress!!
                        item {
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { dashboardTab = 2 },
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(MaterialTheme.colorScheme.primary),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.Speed, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Behavior Alert: Domain Needs Extra Studying", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                        Text("Domain ${stressed.domainNumber}: ${stressed.domainName} (${stressed.avgResponseSeconds}s avg hesitation)", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                        Text("Tap to view complete behavioral telemetry →", fontSize = 11.sp, color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f))
                                    }
                                }
                            }
                        }
                    }

                    // Domain Mastery Breakdown
                    item {
                        Text(
                            text = "Subject Performance & Accuracy",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }

                    items(currentExam.domains) { domain ->
                        val scorePct = domainPerformanceMap[domain.id] ?: 75
                        val isPassing = scorePct >= currentExam.passingScorePercent

                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(1.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Domain ${domain.number}: ${domain.title}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        Text("Weight: ${domain.weightPercent}% of Exam", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Text(
                                        text = "$scorePct%",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = if (isPassing) SuccessGreen else WarningAmber
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                LinearProgressIndicator(
                                    progress = { (scorePct / 100f).coerceIn(0f, 1f) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(6.dp)
                                        .clip(RoundedCornerShape(3.dp)),
                                    color = if (isPassing) SuccessGreen else WarningAmber,
                                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            // TAB 2: USER BEHAVIOR & STRESS TELEMETRY
            2 -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    contentPadding = PaddingValues(top = 14.dp, bottom = 28.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Behavioral Overview Header Card
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(18.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(2.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(CircleShape)
                                            .background(AccentBlue.copy(alpha = 0.15f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.Psychology, contentDescription = null, tint = AccentBlue, modifier = Modifier.size(20.dp))
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text("Student Behavior & Hesitation Telemetry", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                                        Text("Tracks response time, doubt flags & domain stress", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                            }
                        }
                    }

                    // High Stress Callout Banner
                    if (highestStress != null) {
                        val stressed = highestStress!!
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.12f)),
                                border = CardDefaults.outlinedCardBorder().copy(
                                    brush = androidx.compose.ui.graphics.SolidColor(ErrorRed.copy(alpha = 0.5f))
                                )
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.Warning, contentDescription = null, tint = ErrorRed, modifier = Modifier.size(20.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("TOP STRESS DOMAIN", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, color = ErrorRed)
                                        }
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(ErrorRed)
                                                .padding(horizontal = 8.dp, vertical = 2.dp)
                                        ) {
                                            Text("STRESS ${stressed.stressScore}/100", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("Domain ${stressed.domainNumber}: ${stressed.domainName}", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(stressed.aiStressDiagnosis, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, lineHeight = 16.sp)

                                    Spacer(modifier = Modifier.height(12.dp))

                                    // Metrics pills
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Box(
                                            modifier = Modifier
                                                .weight(1f)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(MaterialTheme.colorScheme.surface)
                                                .padding(8.dp)
                                        ) {
                                            Column {
                                                Text("Avg Hesitation", fontSize = 10.sp, color = Slate400)
                                                Text("${stressed.avgResponseSeconds}s / q", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = WarningAmber)
                                            }
                                        }
                                        Box(
                                            modifier = Modifier
                                                .weight(1f)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(MaterialTheme.colorScheme.surface)
                                                .padding(8.dp)
                                        ) {
                                            Column {
                                                Text("Flag / Doubt Rate", fontSize = 10.sp, color = Slate400)
                                                Text("${stressed.flagRatePercent}%", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = WarningAmber)
                                            }
                                        }
                                        Box(
                                            modifier = Modifier
                                                .weight(1f)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(MaterialTheme.colorScheme.surface)
                                                .padding(8.dp)
                                        ) {
                                            Column {
                                                Text("Accuracy", fontSize = 10.sp, color = Slate400)
                                                Text("${stressed.accuracyPercent}%", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = ErrorRed)
                                            }
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(12.dp))

                                    Button(
                                        onClick = {
                                            viewModel.startSimulation(ExamMode.AI_STRESS_STUDY, stressed.domainId)
                                        },
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = ButtonDefaults.buttonColors(containerColor = ErrorRed)
                                    ) {
                                        Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Launch Targeted Stress Blitz on This Domain", fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }

                    // Complete Domain Behavior Telemetry List
                    item {
                        Text(
                            text = "Domain Behavior & Stress Breakdown",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }

                    items(stressMetrics) { metric ->
                        val badgeColor = when (metric.stressLevel) {
                            StressLevel.CRITICAL_STRESS -> ErrorRed
                            StressLevel.HIGH_ATTENTION -> WarningAmber
                            StressLevel.MODERATE_PRACTICE -> AccentBlue
                            StressLevel.ON_TRACK -> AccentCyan
                            StressLevel.MASTERED -> SuccessGreen
                        }

                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    viewModel.startSimulation(ExamMode.DOMAIN_PRACTICE, metric.domainId)
                                },
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(1.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text("Domain ${metric.domainNumber}: ${metric.domainName}", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                        Text("Weight: ${metric.weightPercent}% of Exam", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(badgeColor.copy(alpha = 0.15f))
                                            .padding(horizontal = 8.dp, vertical = 3.dp)
                                    ) {
                                        Text(metric.stressLevel.name.replace("_", " "), fontSize = 10.sp, fontWeight = FontWeight.Bold, color = badgeColor)
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.HourglassTop, contentDescription = null, tint = Slate400, modifier = Modifier.size(13.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Hesitation: ${metric.avgResponseSeconds}s", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Bookmark, contentDescription = null, tint = WarningAmber, modifier = Modifier.size(13.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Flag Rate: ${metric.flagRatePercent}%", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Text("Accuracy: ${metric.accuracyPercent}%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = badgeColor)
                                }

                                Spacer(modifier = Modifier.height(6.dp))
                                Text(metric.aiStressDiagnosis, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, lineHeight = 15.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
