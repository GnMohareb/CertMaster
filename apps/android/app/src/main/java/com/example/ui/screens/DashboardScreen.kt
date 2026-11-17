package com.example.ui.screens

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
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
import com.example.model.EvidenceConfidence
import com.example.model.ExamMode
import com.example.model.StressLevel
import com.example.model.SubStatus
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import com.example.ui.components.PerformanceLineChart
import com.example.ui.components.ReadinessScoreGauge
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.AccentCyan
import com.example.ui.theme.CscBorder
import com.example.ui.theme.CscCardSurface
import com.example.ui.theme.CscCreamSecondary
import com.example.ui.theme.CscDisabledBg
import com.example.ui.theme.CscErrorBg
import com.example.ui.theme.CscErrorBorder
import com.example.ui.theme.CscErrorDark
import com.example.ui.theme.CscPrimaryBlue
import com.example.ui.theme.CscSelectedBg
import com.example.ui.theme.CscSuccessBg
import com.example.ui.theme.CscSuccessBorder
import com.example.ui.theme.CscSuccessDark
import com.example.ui.theme.CscTextPrimary
import com.example.ui.theme.CscTextSecondary
import com.example.ui.theme.CscWarningBg
import com.example.ui.theme.CscWarningBorder
import com.example.ui.theme.CscWarningDark
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.Slate400
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
    val questions by viewModel.questions.collectAsState()
    val sessions by viewModel.sessions.collectAsState()
    val simulationScores by viewModel.simulationScores.collectAsState()
    val savedActiveAttempt by viewModel.savedActiveAttempt.collectAsState()
    val userProfile by viewModel.userProfile.collectAsState()
    val ssoSession by viewModel.ssoSession.collectAsState()
    val readinessReport by viewModel.readinessReport.collectAsState()
    val stressMetrics by viewModel.domainStressMetrics.collectAsState()
    val highestStress by viewModel.highestStressDomain.collectAsState()
    val topicMasteryList by viewModel.topicMasteryList.collectAsState()
    val domainMasteryList by viewModel.domainMasteryList.collectAsState()
    val initialBaselineSession by viewModel.initialBaselineSession.collectAsState()
    val recommendations by viewModel.recommendations.collectAsState()
    val bankMetadata by viewModel.bankMetadata.collectAsState()
    val bankCoverageAudit by viewModel.bankCoverageAudit.collectAsState()

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
    val isOfflineCsc = com.example.BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-") ||
        currentExam.shortCode.contains("CSC", ignoreCase = true)
    val successAccent = if (isOfflineCsc) CscSuccessDark else SuccessGreen
    val warningAccent = if (isOfflineCsc) CscWarningDark else WarningAmber
    val errorAccent = if (isOfflineCsc) CscErrorDark else ErrorRed
    val primaryAccent = if (isOfflineCsc) CscPrimaryBlue else AccentBlue
    val cardBorder = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null
    val cardElevationPrimary = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 2.dp)
    val cardElevationSecondary = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 1.dp)

    val effectiveDomains = if (currentExam.domains.isNotEmpty()) {
        currentExam.domains
    } else {
        com.example.data.ExamCatalog.deriveDomainsFromQuestions(questions, bankMetadata.syllabusWeights)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Top Central Profile & Subscription Status Strip
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
                .clickable(enabled = !isOfflineCsc) { viewModel.navigateTo(AppScreen.CENTRAL_PROFILE) }
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .clip(CircleShape)
                        .background(if (isOfflineCsc) CscSelectedBg else MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
                        .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, CircleShape) else Modifier),
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
                    text = if (isOfflineCsc) "${currentExam.shortCode} • Offline study" else if (ssoSession.isAuthenticated) "${userProfile.displayName.ifEmpty { ssoSession.email }} • ${if (isExamSubscribed) "Access Active" else "No active pass"}" else "Not signed in • Local only (tap to sign in)",
                    fontSize = if (isOfflineCsc) 13.sp else 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                val badgePositive = isOfflineCsc || isExamSubscribed
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(
                            if (isOfflineCsc) {
                                if (badgePositive) CscSuccessBg else CscWarningBg
                            } else {
                                if (badgePositive) SuccessGreen.copy(alpha = 0.15f) else WarningAmber.copy(alpha = 0.15f)
                            }
                        )
                        .then(
                            if (isOfflineCsc) {
                                Modifier.border(1.dp, if (badgePositive) CscSuccessBorder else CscWarningBorder, RoundedCornerShape(6.dp))
                            } else Modifier
                        )
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = if (isOfflineCsc) "OFFLINE" else if (!ssoSession.isAuthenticated) "LOCAL ONLY" else if (isExamSubscribed) "ACTIVE" else "MANAGE PASS",
                        fontSize = if (isOfflineCsc) 12.sp else 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (badgePositive) successAccent else warningAccent
                    )
                }
            }
        }
        if (isOfflineCsc) {
            HorizontalDivider(thickness = 1.dp, color = CscBorder)
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
                        Icon(Icons.Default.TrendingUp, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(5.dp))
                        Text("Score Trends", fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1)
                    }
                },
                modifier = Modifier.testTag("tab_score_trends")
            )
            Tab(
                selected = dashboardTab == 1,
                onClick = { dashboardTab = 1 },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Assessment, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(5.dp))
                        Text("Readiness", fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1)
                    }
                },
                modifier = Modifier.testTag("tab_readiness_mastery")
            )
            Tab(
                selected = dashboardTab == 2,
                onClick = { dashboardTab = 2 },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Speed, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(5.dp))
                        Text("Behavior & Stress", fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 2)
                    }
                },
                modifier = Modifier.testTag("tab_behavior_telemetry")
            )
        }
        if (isOfflineCsc) {
            HorizontalDivider(thickness = 1.dp, color = CscBorder)
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

                    // Resumable in-progress exam attempt persisted in Room SQLite
                    if (savedActiveAttempt != null && questions.isNotEmpty()) {
                        val active = savedActiveAttempt!!
                        val qTotal = active.parseQuestionIds().size
                        val answeredTotal = active.parseUserAnswers().size
                        val minsLeft = active.remainingSeconds / 60
                        val secsLeft = active.remainingSeconds % 60
                        item {
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("card_resume_attempt"),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isOfflineCsc) CscSelectedBg else AccentBlue.copy(alpha = 0.12f)
                                ),
                                border = BorderStroke(1.5.dp, primaryAccent)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "In-Progress Session Saved",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp,
                                        color = primaryAccent
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "Question ${active.currentIndex + 1} of $qTotal • $answeredTotal answered • ${String.format("%02d:%02d", minsLeft, secsLeft)} left",
                                        fontSize = 13.sp,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                                    ) {
                                        Button(
                                            onClick = { viewModel.resumeSavedSimulation() },
                                            modifier = Modifier
                                                .weight(1f)
                                                .heightIn(min = 48.dp),
                                            shape = RoundedCornerShape(10.dp),
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = primaryAccent,
                                                contentColor = Color.White
                                            )
                                        ) {
                                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Resume Exam", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                        }
                                        OutlinedButton(
                                            onClick = { viewModel.abandonSimulation() },
                                            modifier = Modifier.heightIn(min = 48.dp),
                                            shape = RoundedCornerShape(10.dp),
                                            colors = if (isOfflineCsc) {
                                                ButtonDefaults.outlinedButtonColors(
                                                    containerColor = CscCardSurface,
                                                    contentColor = errorAccent
                                                )
                                            } else {
                                                ButtonDefaults.outlinedButtonColors()
                                            },
                                            border = BorderStroke(1.dp, if (isOfflineCsc) CscErrorBorder else MaterialTheme.colorScheme.outline)
                                        ) {
                                            Text("Discard", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = errorAccent)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Standalone CSC offline practice section (adapts cleanly once questions are installed).
                    if (isOfflineCsc) item {
                        val assessedTopics = topicMasteryList.filter { it.isAssessed }
                        val currentMasteryAvg = if (assessedTopics.isNotEmpty()) {
                            assessedTopics.map { it.masteryPercent }.average().toInt()
                        } else null
                        val topRec = recommendations.firstOrNull()
                        val dueCount = topicMasteryList.count {
                            it.isAssessed && it.nextReviewDueAtMillis in 1L..System.currentTimeMillis()
                        }

                        Card(
                            modifier = Modifier.fillMaxWidth().testTag("card_offline_exam_status"),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = CscCardSurface),
                            border = BorderStroke(1.dp, CscBorder),
                            elevation = CardDefaults.cardElevation(0.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "${currentExam.shortCode} Study Plan",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 17.sp,
                                        color = CscTextPrimary
                                    )
                                    if (dueCount > 0) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(CscWarningBg)
                                                .border(1.dp, CscWarningBorder, RoundedCornerShape(6.dp))
                                                .padding(horizontal = 8.dp, vertical = 3.dp)
                                        ) {
                                            Text(
                                                text = "$dueCount DUE REVIEW",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = CscWarningDark
                                            )
                                        }
                                    }
                                }
                                Spacer(modifier = Modifier.height(6.dp))
                                if (questions.isNotEmpty()) {
                                    Text(
                                        text = "${questions.size} practice questions • ${bankCoverageAudit.domainsCount} domains • ${bankCoverageAudit.topicsCount} topics • Pass mark ${currentExam.passingScorePercent}%.",
                                        fontSize = 13.sp,
                                        lineHeight = 19.sp,
                                        color = CscTextSecondary
                                    )
                                    if (initialBaselineSession != null || currentMasteryAvg != null) {
                                        Spacer(modifier = Modifier.height(6.dp))
                                        val baselinePart = initialBaselineSession?.let { "Initial Baseline: ${it.scorePercent}%" } ?: "Initial Baseline: Not taken"
                                        val masteryPart = currentMasteryAvg?.let { "Current Mastery: $it%" } ?: "Practice Mastery: Not assessed"
                                        Text(
                                            text = "$baselinePart • $masteryPart",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            color = CscPrimaryBlue
                                        )
                                    }
                                    if (topRec != null) {
                                        Spacer(modifier = Modifier.height(12.dp))
                                        Card(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .testTag("card_top_recommendation"),
                                            shape = RoundedCornerShape(12.dp),
                                            colors = CardDefaults.cardColors(containerColor = CscCreamSecondary),
                                            border = BorderStroke(1.dp, CscBorder),
                                            elevation = CardDefaults.cardElevation(0.dp)
                                        ) {
                                            Column(modifier = Modifier.padding(14.dp)) {
                                                Text(
                                                    text = "Recommended Next: ${topRec.title}",
                                                    fontSize = 15.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = CscTextPrimary
                                                )
                                                Spacer(modifier = Modifier.height(4.dp))
                                                Text(
                                                    text = topRec.reason,
                                                    fontSize = 13.sp,
                                                    lineHeight = 19.sp,
                                                    color = CscTextSecondary
                                                )
                                                Spacer(modifier = Modifier.height(10.dp))
                                                Button(
                                                    onClick = {
                                                        viewModel.startSimulation(
                                                            mode = topRec.mode,
                                                            domainFilterId = topRec.targetDomainId,
                                                            topicFilterKey = topRec.targetTopicKey
                                                        )
                                                    },
                                                    modifier = Modifier
                                                        .fillMaxWidth()
                                                        .heightIn(min = 48.dp)
                                                        .testTag("btn_recommended_practice"),
                                                    shape = RoundedCornerShape(10.dp),
                                                    colors = ButtonDefaults.buttonColors(
                                                        containerColor = CscPrimaryBlue,
                                                        contentColor = Color.White
                                                    )
                                                ) {
                                                    Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(18.dp))
                                                    Spacer(modifier = Modifier.width(6.dp))
                                                    Text(topRec.title, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                                }
                                            }
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        OutlinedButton(
                                            onClick = { viewModel.startSimulation(ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT) },
                                            shape = RoundedCornerShape(10.dp),
                                            border = BorderStroke(1.dp, CscBorder),
                                            colors = ButtonDefaults.outlinedButtonColors(
                                                containerColor = CscCardSurface,
                                                contentColor = CscPrimaryBlue
                                            ),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 10.dp),
                                            modifier = Modifier
                                                .weight(1f)
                                                .heightIn(min = 48.dp)
                                                .testTag("btn_initial_assessment")
                                        ) {
                                            Text(
                                                text = if (initialBaselineSession == null) "Initial Assessment" else "Retake Check",
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                        OutlinedButton(
                                            onClick = { viewModel.startAdaptivePractice() },
                                            shape = RoundedCornerShape(10.dp),
                                            border = BorderStroke(1.dp, CscBorder),
                                            colors = ButtonDefaults.outlinedButtonColors(
                                                containerColor = CscCardSurface,
                                                contentColor = CscPrimaryBlue
                                            ),
                                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 10.dp),
                                            modifier = Modifier
                                                .weight(1f)
                                                .heightIn(min = 48.dp)
                                                .testTag("btn_adaptive_practice")
                                        ) {
                                            Text("Adaptive Drill", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    val simulationPapers = bankMetadata.simulationPapers
                                    val hasReservedFullExam = bankCoverageAudit.reservedFullExamCount > 0
                                    val hasSimulationPapers = simulationPapers.isNotEmpty()
                                    if (hasSimulationPapers || hasReservedFullExam) {
                                        Button(
                                            onClick = { viewModel.navigateTo(AppScreen.EXAM_HUB) },
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .heightIn(min = 48.dp)
                                                .testTag("btn_offline_exam"),
                                            shape = RoundedCornerShape(10.dp),
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = CscPrimaryBlue,
                                                contentColor = Color.White,
                                                disabledContainerColor = CscDisabledBg,
                                                disabledContentColor = CscTextSecondary
                                            )
                                        ) {
                                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text(
                                                text = if (hasSimulationPapers) {
                                                    val firstPaper = simulationPapers.first()
                                                    "Choose Timed Practice (${simulationPapers.size} Papers • ${firstPaper.questionIds.size} Qs)"
                                                } else {
                                                    "Full Timed Exam (${bankCoverageAudit.reservedFullExamCount} Qs)"
                                                },
                                                fontSize = 14.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(8.dp))
                                        OutlinedButton(
                                            onClick = { viewModel.navigateTo(AppScreen.EXAM_HUB) },
                                            shape = RoundedCornerShape(10.dp),
                                            border = BorderStroke(1.dp, CscBorder),
                                            colors = ButtonDefaults.outlinedButtonColors(
                                                containerColor = CscCreamSecondary,
                                                contentColor = CscTextPrimary
                                            ),
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .heightIn(min = 48.dp)
                                                .testTag("btn_browse_topics")
                                        ) {
                                            Text(
                                                text = if (hasSimulationPapers) {
                                                    "Choose Exams 3–6, ${bankCoverageAudit.domainsCount} Domains & ${bankCoverageAudit.topicsCount} Topics"
                                                } else {
                                                    "Browse ${bankCoverageAudit.domainsCount} Domains & ${bankCoverageAudit.topicsCount} Topics"
                                                },
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    } else {
                                        OutlinedButton(
                                            onClick = { viewModel.navigateTo(AppScreen.EXAM_HUB) },
                                            shape = RoundedCornerShape(10.dp),
                                            border = BorderStroke(1.dp, CscBorder),
                                            colors = ButtonDefaults.outlinedButtonColors(
                                                containerColor = CscCardSurface,
                                                contentColor = CscPrimaryBlue
                                            ),
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .heightIn(min = 48.dp)
                                                .testTag("btn_browse_topics")
                                        ) {
                                            Text(
                                                "Browse ${bankCoverageAudit.domainsCount} Domains & ${bankCoverageAudit.topicsCount} Topics",
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(8.dp))
                                        OutlinedButton(
                                            onClick = { viewModel.startSimulation(ExamMode.FULL_SIMULATION) },
                                            enabled = false,
                                            shape = RoundedCornerShape(10.dp),
                                            border = BorderStroke(1.dp, CscBorder),
                                            colors = ButtonDefaults.outlinedButtonColors(
                                                disabledContainerColor = CscDisabledBg,
                                                disabledContentColor = CscTextSecondary
                                            ),
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .heightIn(min = 48.dp)
                                                .testTag("btn_offline_exam")
                                        ) {
                                            Text(
                                                "Full Timed Exam Simulation (Coming Soon)",
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                        }
                                    }
                                } else {
                                    Text(
                                        text = "Exam features are prepared for offline use. Practice questions are not installed yet.",
                                        fontSize = 13.sp,
                                        lineHeight = 19.sp,
                                        color = CscTextSecondary
                                    )
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                                    ) {
                                        Button(
                                            onClick = { viewModel.startSimulation(ExamMode.FULL_SIMULATION) },
                                            modifier = Modifier
                                                .weight(1f)
                                                .heightIn(min = 48.dp)
                                                .testTag("btn_offline_exam"),
                                            enabled = false,
                                            colors = ButtonDefaults.buttonColors(
                                                disabledContainerColor = CscDisabledBg,
                                                disabledContentColor = CscTextSecondary
                                            )
                                        ) {
                                            Text("Questions Not Installed", fontSize = 13.sp)
                                        }
                                        OutlinedButton(
                                            onClick = { viewModel.navigateTo(AppScreen.NOTEBOOK_SOURCES) },
                                            border = BorderStroke(1.dp, CscBorder),
                                            modifier = Modifier
                                                .weight(1f)
                                                .heightIn(min = 48.dp)
                                        ) {
                                            Text("Study Notes & Cards", fontSize = 13.sp)
                                        }
                                    }
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
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }

                    items(simulationScores.asReversed()) { attempt ->
                        val isPassed = attempt.isPassed
                        val badgeTextColor = if (isPassed) successAccent else errorAccent
                        val badgeBg = if (isOfflineCsc) {
                            if (isPassed) CscSuccessBg else CscErrorBg
                        } else {
                            badgeTextColor.copy(alpha = 0.15f)
                        }
                        val badgeBorder = if (isPassed) CscSuccessBorder else CscErrorBorder
                        val domainBreakdown = attempt.parseDomainScores()

                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .clickable {
                                    val matchedSession = sessions.firstOrNull { it.sessionId == attempt.id }
                                        ?: attempt.toExamSession()
                                    viewModel.openHistoricalSession(matchedSession)
                                },
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            border = cardBorder,
                            elevation = cardElevationSecondary
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
                                                .size(34.dp)
                                                .clip(CircleShape)
                                                .background(badgeBg)
                                                .then(if (isOfflineCsc) Modifier.border(1.dp, badgeBorder, CircleShape) else Modifier),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "#${attempt.attemptNumber}",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = badgeTextColor
                                            )
                                        }
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Column {
                                            Text(
                                                text = "Simulation Run #${attempt.attemptNumber}",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp,
                                                color = MaterialTheme.colorScheme.onSurface
                                            )
                                            Text(
                                                text = SimpleDateFormat("MMM d, yyyy • h:mm a", Locale.getDefault()).format(Date(attempt.timestampMillis)),
                                                fontSize = 12.sp,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }

                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = "${attempt.overallScorePercent}%",
                                            fontWeight = FontWeight.ExtraBold,
                                            fontSize = 16.sp,
                                            color = badgeTextColor
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(badgeBg)
                                                .then(if (isOfflineCsc) Modifier.border(1.dp, badgeBorder, RoundedCornerShape(6.dp)) else Modifier)
                                                .padding(horizontal = 8.dp, vertical = 3.dp)
                                        ) {
                                            Text(
                                                text = if (isPassed) "PASS" else "FAIL",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = badgeTextColor
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
                                                    .clip(RoundedCornerShape(8.dp))
                                                    .background(if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                                    .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(8.dp)) else Modifier)
                                                    .padding(horizontal = 6.dp, vertical = 5.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                    Text(
                                                        text = dRec.domainId.uppercase(),
                                                        fontSize = 11.sp,
                                                        color = if (isOfflineCsc) CscTextSecondary else Slate400
                                                    )
                                                    Text(
                                                        "${dRec.scorePercent}%",
                                                        fontSize = 13.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = if (dPassing) successAccent else warningAccent
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
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            border = cardBorder,
                            elevation = cardElevationPrimary
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .then(
                                        if (isOfflineCsc) {
                                            Modifier
                                        } else {
                                            Modifier.background(
                                                Brush.linearGradient(
                                                    listOf(Color(currentExam.primaryColorHex).copy(alpha = 0.12f), Color.Transparent)
                                                )
                                            )
                                        }
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
                                            .background(if (isOfflineCsc) CscSelectedBg else Color(currentExam.primaryColorHex))
                                            .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(8.dp)) else Modifier)
                                            .padding(horizontal = 10.dp, vertical = 4.dp)
                                    ) {
                                        Text(
                                            currentExam.shortCode,
                                            color = if (isOfflineCsc) CscPrimaryBlue else Color.White,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp
                                        )
                                    }
                                    Text(
                                        text = if (effectiveDomains.isEmpty()) "Offline Mode" else "${effectiveDomains.size} Domains",
                                        fontSize = 13.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                                Text(currentExam.title, fontSize = 17.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(currentExam.description, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, lineHeight = 20.sp)
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
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
                                border = cardBorder
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
                                        Text("Behavior Alert: Domain Needs Extra Studying", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                                        Text("Domain ${stressed.domainNumber}: ${stressed.domainName} (${stressed.avgResponseSeconds}s avg hesitation)", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                        Text("Tap to view behavioral telemetry →", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                            }
                        }
                    }

                    // Domain & Topic Mastery Breakdown
                    item {
                        Text(
                            text = if (isOfflineCsc) "Domain & Topic Mastery" else "Subject Performance & Accuracy",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }

                    if (isOfflineCsc && domainMasteryList.isNotEmpty()) {
                        items(domainMasteryList) { dSummary ->
                            val isAssessed = dSummary.isAssessed
                            val barColor = when {
                                !isAssessed -> CscTextSecondary
                                dSummary.confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE -> CscWarningDark
                                dSummary.masteryPercent >= currentExam.passingScorePercent -> CscSuccessDark
                                else -> CscErrorDark
                            }
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        viewModel.startAdaptivePractice(domainFilterId = dSummary.domainId)
                                    },
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = CscCardSurface),
                                border = BorderStroke(1.dp, CscBorder),
                                elevation = CardDefaults.cardElevation(0.dp)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                            Text(dSummary.domainName, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = CscTextPrimary)
                                            Spacer(modifier = Modifier.height(2.dp))
                                            val subtitle = buildString {
                                                append(dSummary.confidence.displayLabel())
                                                if (isAssessed) {
                                                    append(" • ${dSummary.correctCount}/${dSummary.attemptCount} correct")
                                                }
                                                dSummary.baselineScorePercent?.let {
                                                    append(" • Baseline: $it%")
                                                }
                                            }
                                            Text(subtitle, fontSize = 13.sp, color = CscTextSecondary)
                                        }
                                        Text(
                                            text = if (!isAssessed) "Not assessed" else "${dSummary.masteryPercent}%",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = if (!isAssessed) 12.sp else 15.sp,
                                            color = barColor
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    LinearProgressIndicator(
                                        progress = { if (isAssessed) (dSummary.masteryPercent / 100f).coerceIn(0f, 1f) else 0f },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(6.dp)
                                            .clip(RoundedCornerShape(3.dp)),
                                        color = barColor,
                                        trackColor = CscCreamSecondary
                                    )
                                }
                            }
                        }

                        if (topicMasteryList.isNotEmpty()) {
                            item {
                                Text(
                                    text = "Topic Mastery & Practice Targets",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onBackground
                                )
                            }
                            items(topicMasteryList) { topic ->
                                val tColor = when {
                                    !topic.isAssessed -> CscTextSecondary
                                    topic.confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE -> CscWarningDark
                                    topic.masteryPercent >= 80 -> CscSuccessDark
                                    topic.masteryPercent < 65 -> CscErrorDark
                                    else -> CscPrimaryBlue
                                }
                                val tBg = when {
                                    !topic.isAssessed -> CscCreamSecondary
                                    topic.confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE -> CscWarningBg
                                    topic.masteryPercent >= 80 -> CscSuccessBg
                                    topic.masteryPercent < 65 -> CscErrorBg
                                    else -> CscSelectedBg
                                }
                                val tBorder = when {
                                    !topic.isAssessed -> CscBorder
                                    topic.confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE -> CscWarningBorder
                                    topic.masteryPercent >= 80 -> CscSuccessBorder
                                    topic.masteryPercent < 65 -> CscErrorBorder
                                    else -> CscBorder
                                }
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            viewModel.startAdaptivePractice(topicFilterKey = topic.topicKey)
                                        },
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = CscCardSurface),
                                    border = BorderStroke(1.dp, CscBorder),
                                    elevation = CardDefaults.cardElevation(0.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth().padding(14.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                            Text(topic.topicName, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = CscTextPrimary)
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Text(
                                                text = if (!topic.isAssessed) {
                                                    "${topic.domainName} • Not assessed"
                                                } else {
                                                    val baseText = topic.baselineScorePercent?.let { " • Baseline $it%" } ?: ""
                                                    "${topic.confidence.displayLabel()} • ${topic.correctCount}/${topic.attemptCount} (${topic.uniqueQuestionCount} unique)$baseText"
                                                },
                                                fontSize = 12.sp,
                                                color = CscTextSecondary
                                            )
                                        }
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(tBg)
                                                .border(1.dp, tBorder, RoundedCornerShape(6.dp))
                                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                text = if (!topic.isAssessed) "Practice" else "${topic.masteryPercent}%",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = tColor
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    } else if (effectiveDomains.isEmpty()) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = cardBorder
                            ) {
                                Text(
                                    text = "Domain mastery breakdown will appear once practice questions or completed simulations are recorded.",
                                    fontSize = 13.sp,
                                    lineHeight = 19.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(16.dp)
                                )
                            }
                        }
                    } else {
                        items(effectiveDomains) { domain ->
                            val recordedPct = domainPerformanceMap[domain.id]
                            val scorePct = recordedPct ?: if (isOfflineCsc) 0 else 75
                            val isPassing = recordedPct != null && scorePct >= currentExam.passingScorePercent || (!isOfflineCsc && scorePct >= currentExam.passingScorePercent)

                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = cardBorder,
                                elevation = cardElevationSecondary
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text("Domain ${domain.number}: ${domain.title}", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                            Text("Weight: ${domain.weightPercent}% of Exam", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        }
                                        Text(
                                            text = if (isOfflineCsc && recordedPct == null) "Not assessed" else "$scorePct%",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = if (isOfflineCsc && recordedPct == null) 12.sp else 15.sp,
                                            color = if (isOfflineCsc && recordedPct == null) (if (isOfflineCsc) CscTextSecondary else Slate400) else if (isPassing) successAccent else warningAccent
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    LinearProgressIndicator(
                                        progress = { (scorePct / 100f).coerceIn(0f, 1f) },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(6.dp)
                                            .clip(RoundedCornerShape(3.dp)),
                                        color = if (isPassing) successAccent else warningAccent,
                                        trackColor = if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant
                                    )
                                }
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
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            border = cardBorder,
                            elevation = cardElevationPrimary
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(if (isOfflineCsc) CscSelectedBg else AccentBlue.copy(alpha = 0.15f))
                                            .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, CircleShape) else Modifier),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.Psychology, contentDescription = null, tint = primaryAccent, modifier = Modifier.size(22.dp))
                                    }
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text("Behavior & Hesitation Telemetry", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                        Text("Tracks response time, doubt flags & domain stress", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
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
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isOfflineCsc) CscErrorBg else ErrorRed.copy(alpha = 0.12f)
                                ),
                                border = BorderStroke(1.5.dp, if (isOfflineCsc) CscErrorBorder else ErrorRed.copy(alpha = 0.5f))
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.Warning, contentDescription = null, tint = errorAccent, modifier = Modifier.size(20.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("TOP STRESS DOMAIN", fontSize = 12.sp, fontWeight = FontWeight.ExtraBold, color = errorAccent)
                                        }
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(if (isOfflineCsc) CscCardSurface else ErrorRed)
                                                .then(if (isOfflineCsc) Modifier.border(1.dp, CscErrorBorder, RoundedCornerShape(6.dp)) else Modifier)
                                                .padding(horizontal = 8.dp, vertical = 3.dp)
                                        ) {
                                            Text(
                                                "STRESS ${stressed.stressScore}/100",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (isOfflineCsc) CscErrorDark else Color.White
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text("Domain ${stressed.domainNumber}: ${stressed.domainName}", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(stressed.aiStressDiagnosis, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, lineHeight = 19.sp)

                                    Spacer(modifier = Modifier.height(12.dp))

                                    // Metrics pills
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Box(
                                            modifier = Modifier
                                                .weight(1f)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(MaterialTheme.colorScheme.surface)
                                                .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(8.dp)) else Modifier)
                                                .padding(10.dp)
                                        ) {
                                            Column {
                                                Text("Avg Hesitation", fontSize = 12.sp, color = if (isOfflineCsc) CscTextSecondary else Slate400)
                                                Text("${stressed.avgResponseSeconds}s / q", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = warningAccent)
                                            }
                                        }
                                        Box(
                                            modifier = Modifier
                                                .weight(1f)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(MaterialTheme.colorScheme.surface)
                                                .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(8.dp)) else Modifier)
                                                .padding(10.dp)
                                        ) {
                                            Column {
                                                Text("Flag / Doubt Rate", fontSize = 12.sp, color = if (isOfflineCsc) CscTextSecondary else Slate400)
                                                Text("${stressed.flagRatePercent}%", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = warningAccent)
                                            }
                                        }
                                        Box(
                                            modifier = Modifier
                                                .weight(1f)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(MaterialTheme.colorScheme.surface)
                                                .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(8.dp)) else Modifier)
                                                .padding(10.dp)
                                        ) {
                                            Column {
                                                Text("Accuracy", fontSize = 12.sp, color = if (isOfflineCsc) CscTextSecondary else Slate400)
                                                Text("${stressed.accuracyPercent}%", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = errorAccent)
                                            }
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(12.dp))

                                    Button(
                                        onClick = {
                                            viewModel.startSimulation(ExamMode.AI_STRESS_STUDY, stressed.domainId)
                                        },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .heightIn(min = 48.dp),
                                        shape = RoundedCornerShape(10.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = errorAccent, contentColor = Color.White)
                                    ) {
                                        Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Launch Targeted Stress Drill", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }
                    }

                    // Complete Domain Behavior Telemetry List
                    item {
                        Text(
                            text = "Domain Behavior & Stress Breakdown",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }

                    items(stressMetrics) { metric ->
                        val badgeColor = if (isOfflineCsc) {
                            when (metric.stressLevel) {
                                StressLevel.CRITICAL_STRESS -> CscErrorDark
                                StressLevel.HIGH_ATTENTION -> CscWarningDark
                                StressLevel.MODERATE_PRACTICE -> CscPrimaryBlue
                                StressLevel.ON_TRACK -> CscPrimaryBlue
                                StressLevel.MASTERED -> CscSuccessDark
                            }
                        } else {
                            when (metric.stressLevel) {
                                StressLevel.CRITICAL_STRESS -> ErrorRed
                                StressLevel.HIGH_ATTENTION -> WarningAmber
                                StressLevel.MODERATE_PRACTICE -> AccentBlue
                                StressLevel.ON_TRACK -> AccentCyan
                                StressLevel.MASTERED -> SuccessGreen
                            }
                        }
                        val badgeBg = if (isOfflineCsc) {
                            when (metric.stressLevel) {
                                StressLevel.CRITICAL_STRESS -> CscErrorBg
                                StressLevel.HIGH_ATTENTION -> CscWarningBg
                                StressLevel.MODERATE_PRACTICE -> CscSelectedBg
                                StressLevel.ON_TRACK -> CscSelectedBg
                                StressLevel.MASTERED -> CscSuccessBg
                            }
                        } else {
                            badgeColor.copy(alpha = 0.15f)
                        }
                        val badgeBorder = when (metric.stressLevel) {
                            StressLevel.CRITICAL_STRESS -> CscErrorBorder
                            StressLevel.HIGH_ATTENTION -> CscWarningBorder
                            StressLevel.MODERATE_PRACTICE -> CscBorder
                            StressLevel.ON_TRACK -> CscBorder
                            StressLevel.MASTERED -> CscSuccessBorder
                        }

                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    viewModel.startSimulation(ExamMode.DOMAIN_PRACTICE, metric.domainId)
                                },
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            border = cardBorder,
                            elevation = cardElevationSecondary
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                        Text("Domain ${metric.domainNumber}: ${metric.domainName}", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurface)
                                        Text("Weight: ${metric.weightPercent}% of Exam", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(badgeBg)
                                            .then(if (isOfflineCsc) Modifier.border(1.dp, badgeBorder, RoundedCornerShape(6.dp)) else Modifier)
                                            .padding(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                        Text(metric.stressLevel.name.replace("_", " "), fontSize = 12.sp, fontWeight = FontWeight.Bold, color = badgeColor)
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.HourglassTop, contentDescription = null, tint = if (isOfflineCsc) CscTextSecondary else Slate400, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Hesitation: ${metric.avgResponseSeconds}s", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.Bookmark, contentDescription = null, tint = warningAccent, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("Flag Rate: ${metric.flagRatePercent}%", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Text("Accuracy: ${metric.accuracyPercent}%", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = badgeColor)
                                }

                                Spacer(modifier = Modifier.height(8.dp))
                                Text(metric.aiStressDiagnosis, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, lineHeight = 18.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

