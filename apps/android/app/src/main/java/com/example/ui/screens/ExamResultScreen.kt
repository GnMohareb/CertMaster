package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Replay
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
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
import com.example.data.local.SimulationScoreEntity
import com.example.model.EvidenceConfidence
import com.example.model.ExamMode
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.CscBorder
import com.example.ui.theme.CscCardSurface
import com.example.ui.theme.CscCreamSecondary
import com.example.ui.theme.CscErrorBg
import com.example.ui.theme.CscErrorBorder
import com.example.ui.theme.CscErrorDark
import com.example.ui.theme.CscPrimaryBlue
import com.example.ui.theme.CscSelectedBg
import com.example.ui.theme.CscSuccessBg
import com.example.ui.theme.CscSuccessBorder
import com.example.ui.theme.CscSuccessDark
import com.example.ui.theme.CscTextSecondary
import com.example.ui.theme.CscWarningDark
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.GoldMastery
import com.example.ui.theme.Slate400
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WarningAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExamResultScreen(
    viewModel: ExamViewModel,
    modifier: Modifier = Modifier
) {
    val session = viewModel.lastCompletedSession.collectAsState().value
    val currentExam by viewModel.currentExam.collectAsState()
    val questions by viewModel.simulationQuestions.collectAsState()
    val userProfile by viewModel.userProfile.collectAsState()
    val topicMasteryList by viewModel.topicMasteryList.collectAsState()
    val domainMasteryList by viewModel.domainMasteryList.collectAsState()
    val initialBaselineSession by viewModel.initialBaselineSession.collectAsState()
    val recommendations by viewModel.recommendations.collectAsState()
    val bankCoverageAudit by viewModel.bankCoverageAudit.collectAsState()
    val lastSimulationPaperId by viewModel.lastSimulationPaperId.collectAsState()
    val lastSimulationPaperTitle by viewModel.lastSimulationPaperTitle.collectAsState()

    val isOfflineCsc = com.example.BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-") ||
        currentExam.id.startsWith("csc-part-")

    val isExamSubscribed = isOfflineCsc || userProfile.subscriptions.any {
        it.examId == currentExam.id && it.status == com.example.model.SubStatus.ACTIVE
    }

    BackHandler {
        viewModel.navigateTo(AppScreen.DASHBOARD)
    }

    if (session == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No test session available.")
        }
        return
    }

    val isPassed = session.isPassed
    val score = session.scorePercent
    val passing = currentExam.passingScorePercent
    val topicScores = SimulationScoreEntity.parseTopicScoresJson(session.topicScoresJson)
    val assessedTopics = topicMasteryList.filter { it.isAssessed }
    val currentPracticeMasteryAvg = if (assessedTopics.isNotEmpty()) {
        assessedTopics.map { it.masteryPercent }.average().toInt()
    } else null
    val unassessedDomains = domainMasteryList.filter { !it.isAssessed }

    val bannerColor = if (isOfflineCsc) {
        if (isPassed) CscSuccessDark else CscErrorDark
    } else {
        if (isPassed) SuccessGreen else ErrorRed
    }
    val bannerBgColor = if (isOfflineCsc) {
        if (isPassed) CscSuccessBg else CscErrorBg
    } else {
        bannerColor.copy(alpha = 0.12f)
    }
    val bannerBorderColor = if (isOfflineCsc) {
        if (isPassed) CscSuccessBorder else CscErrorBorder
    } else {
        bannerColor.copy(alpha = 0.5f)
    }
    val bannerTitle = if (isPassed) "PROVISIONAL PASS" else "NEEDS ADDITIONAL PREPARATION"

    val correctCount = if (questions.isNotEmpty()) {
        questions.count { q ->
            val qIdx = questions.indexOf(q)
            session.userAnswers[qIdx] == q.correctIndex
        }
    } else {
        session.domainScores.sumOf { it.correctCount }.takeIf { it > 0 }
            ?: ((session.scorePercent * session.totalQuestions) / 100)
    }

    val durationMinutes = session.durationSeconds / 60
    val durationRemainderSeconds = session.durationSeconds % 60
    val formattedDuration = if (durationMinutes > 0) {
        "${durationMinutes}m ${durationRemainderSeconds}s"
    } else {
        "${durationRemainderSeconds}s"
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        TopAppBar(
            title = { Text("Score Report & Diagnostics", fontWeight = FontWeight.Bold) },
            navigationIcon = {
                IconButton(onClick = { viewModel.navigateTo(AppScreen.DASHBOARD) }) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Return to Dashboard")
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
        )
        if (isOfflineCsc) {
            HorizontalDivider(thickness = 1.dp, color = CscBorder)
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 12.dp, bottom = 28.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Hero Result Banner
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("score_report_banner"),
                    shape = RoundedCornerShape(if (isOfflineCsc) 16.dp else 20.dp),
                    colors = CardDefaults.cardColors(containerColor = bannerBgColor),
                    border = BorderStroke(if (isOfflineCsc) 1.5.dp else 1.dp, bannerBorderColor),
                    elevation = CardDefaults.cardElevation(0.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(bannerColor),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isPassed) Icons.Default.Check else Icons.Default.Close,
                                contentDescription = if (isPassed) "Passed" else "Failed",
                                tint = Color.White,
                                modifier = Modifier.size(32.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = bannerTitle,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = bannerColor,
                            letterSpacing = 0.5.sp
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "$score%",
                            fontSize = 42.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = bannerColor
                        )

                        Text(
                            text = "Target Threshold: $passing% • $correctCount of ${session.totalQuestions} Correct • $formattedDuration",
                            fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Actions Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            val canRetakeSameMode = !isOfflineCsc ||
                                session.mode != ExamMode.FULL_SIMULATION ||
                                bankCoverageAudit.reservedFullExamCount > 0 ||
                                bankCoverageAudit.simulationPapersCount > 0
                            OutlinedButton(
                                onClick = {
                                    if (canRetakeSameMode) {
                                        viewModel.startSimulation(
                                            mode = session.mode,
                                            simulationPaperId = if (session.mode == ExamMode.FULL_SIMULATION) lastSimulationPaperId else null
                                        )
                                    } else {
                                        viewModel.startAdaptivePractice()
                                    }
                                },
                                shape = RoundedCornerShape(12.dp),
                                border = BorderStroke(1.dp, if (isOfflineCsc) CscBorder else MaterialTheme.colorScheme.outline),
                                colors = if (isOfflineCsc) {
                                    ButtonDefaults.outlinedButtonColors(
                                        containerColor = CscCardSurface,
                                        contentColor = CscPrimaryBlue
                                    )
                                } else {
                                    ButtonDefaults.outlinedButtonColors()
                                },
                                modifier = Modifier
                                    .weight(1f)
                                    .heightIn(min = 48.dp)
                            ) {
                                Icon(Icons.Default.Replay, contentDescription = "Retake", modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = if (canRetakeSameMode) "Retake Test" else "Practice Drill",
                                    fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }

                            if (isOfflineCsc) {
                                Button(
                                    onClick = { viewModel.navigateTo(AppScreen.EXAM_HUB) },
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier
                                        .weight(1f)
                                        .heightIn(min = 48.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = CscPrimaryBlue,
                                        contentColor = Color.White
                                    )
                                ) {
                                    Icon(Icons.Default.MenuBook, contentDescription = "Exams Hub", modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Exams Hub", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                }
                            } else {
                                Button(
                                    onClick = { viewModel.navigateTo(AppScreen.AI_TUTOR) },
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                                ) {
                                    Icon(Icons.Default.AutoAwesome, contentDescription = "Ask AI", modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("AI Tutor Drill", fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }

            // 50-Question Assessment Conversion / Upgrade Card for Free Tier
            if (!isOfflineCsc && !isExamSubscribed) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("card_upgrade_prompt"),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(GoldMastery.copy(alpha = 0.6f)))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(GoldMastery.copy(alpha = 0.2f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = GoldMastery, modifier = Modifier.size(20.dp))
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "50-Question Assessment Complete",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = "Ready to unlock the Complete ${currentExam.shortCode} Exam?",
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = "You have completed the free 50-question diagnostic benchmark. Upgrade to the Complete Exam Pass to unlock 1,000+ simulation questions, full timed mock exams, all study guides, and cross-platform synchronization with the CertMaster Web Platform.",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                lineHeight = 17.sp
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            Button(
                                onClick = { viewModel.navigateTo(AppScreen.CENTRAL_PROFILE) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("btn_upgrade_complete_exam"),
                                colors = ButtonDefaults.buttonColors(containerColor = GoldMastery)
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Upgrade to Complete Exam Pass", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            // Coverage & Evidence Summary Card
            item {
                val answeredInAttempt = session.userAnswers.size
                val baselineLabel = when {
                    session.mode == ExamMode.FULL_SIMULATION && !lastSimulationPaperTitle.isNullOrBlank() ->
                        lastSimulationPaperTitle!!
                    session.isInitialBaseline -> "Initial Baseline (Fixed)"
                    session.mode == ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT -> "Assessment Retake (Historical)"
                    else -> session.mode.name.replace("_", " ")
                }
                Card(
                    modifier = Modifier.fillMaxWidth().testTag("card_result_coverage_summary"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                    elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 1.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "Coverage & Evidence Summary",
                            fontWeight = FontWeight.Bold,
                            fontSize = if (isOfflineCsc) 15.sp else 14.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Session Type: $baselineLabel • Answered $answeredInAttempt of ${session.totalQuestions} questions",
                            fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = session.coverageSummary.ifBlank { bankCoverageAudit.coverageDescription },
                            fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                            lineHeight = 19.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        if (initialBaselineSession != null || currentPracticeMasteryAvg != null) {
                            val bText = initialBaselineSession?.let { "Fixed Initial Baseline: ${it.scorePercent}%" } ?: "Fixed Initial Baseline: Not set"
                            val cText = currentPracticeMasteryAvg?.let { "Current Topic Mastery: $it%" } ?: "Current Topic Mastery: Insufficient evidence"
                            Text(
                                text = "$bText • $cText",
                                fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }

            // Domain-by-Domain Diagnostic Breakdown
            item {
                Text(
                    text = "Domain Mastery Breakdown",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            itemsIndexed(session.domainScores) { _, domainScore ->
                val isDomainPassing = domainScore.percentage >= passing
                val barColor = if (isOfflineCsc) {
                    if (isDomainPassing) CscSuccessDark else CscWarningDark
                } else {
                    if (isDomainPassing) SuccessGreen else WarningAmber
                }

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                    elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 1.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = domainScore.domainName,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = if (isOfflineCsc) 14.sp else 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "${domainScore.correctCount} / ${domainScore.totalCount} correct",
                                    fontSize = if (isOfflineCsc) 12.sp else 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Text(
                                text = "${domainScore.percentage}%",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = barColor
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        LinearProgressIndicator(
                            progress = { (domainScore.percentage / 100f).coerceIn(0f, 1f) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = barColor,
                            trackColor = if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant
                        )
                    }
                }
            }

            if (unassessedDomains.isNotEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth().testTag("card_unassessed_domains"),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
                        ),
                        border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                        elevation = CardDefaults.cardElevation(0.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "Not Assessed Yet (Excluded from Weak Areas)",
                                fontWeight = FontWeight.Bold,
                                fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = unassessedDomains.joinToString(", ") { it.domainName },
                                fontSize = if (isOfflineCsc) 12.sp else 11.sp,
                                lineHeight = 18.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            // Topic Breakdown & Evidence
            if (topicScores.isNotEmpty()) {
                item {
                    Text(
                        text = "Topic Breakdown & Evidence",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }

                items(topicScores) { tScore ->
                    val statusColor = if (isOfflineCsc) {
                        when {
                            tScore.confidence == EvidenceConfidence.UNASSESSED -> CscTextSecondary
                            tScore.confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE -> CscWarningDark
                            tScore.percentage >= passing -> CscSuccessDark
                            else -> CscErrorDark
                        }
                    } else {
                        when {
                            tScore.confidence == EvidenceConfidence.UNASSESSED -> Slate400
                            tScore.confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE -> WarningAmber
                            tScore.percentage >= passing -> SuccessGreen
                            else -> ErrorRed
                        }
                    }
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                        elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 1.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = tScore.topicName,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = if (isOfflineCsc) 14.sp else 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "${tScore.correctCount} / ${tScore.totalCount} correct • ${tScore.confidence.displayLabel()}",
                                    fontSize = if (isOfflineCsc) 12.sp else 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "${tScore.percentage}%",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = statusColor
                            )
                        }
                    }
                }
            }

            // Recommended Practice Next
            if (recommendations.isNotEmpty()) {
                item {
                    Text(
                        text = "Recommended Practice Next",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }

                items(recommendations.take(3)) { rec ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                        elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 1.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                text = rec.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = if (isOfflineCsc) 14.sp else 13.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = rec.reason,
                                fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                                lineHeight = 19.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Button(
                                onClick = {
                                    viewModel.startSimulation(
                                        mode = rec.mode,
                                        domainFilterId = rec.targetDomainId,
                                        topicFilterKey = rec.targetTopicKey
                                    )
                                },
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = 48.dp)
                                    .testTag("btn_result_rec_${rec.id}"),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = Color.White
                                )
                            ) {
                                Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(rec.title, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // Detailed Question-by-Question Review with Source Citations
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Question-by-Question Analysis",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            if (questions.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                        elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 1.dp)
                    ) {
                        Text(
                            text = "Detailed question-by-question breakdown is available when the questions from this attempt are available in the question bank.",
                            fontSize = if (isOfflineCsc) 14.sp else 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(16.dp),
                            lineHeight = 20.sp
                        )
                    }
                }
            }

            itemsIndexed(questions) { qIdx, question ->
                val userChoice = session.userAnswers[qIdx]
                val isCorrect = userChoice == question.correctIndex
                val qSuccessColor = if (isOfflineCsc) CscSuccessDark else SuccessGreen
                val qErrorColor = if (isOfflineCsc) CscErrorDark else ErrorRed
                val citationColor = if (isOfflineCsc) CscPrimaryBlue else AccentBlue

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                    elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 1.dp)
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
                                        .size(24.dp)
                                        .clip(CircleShape)
                                        .background(if (isCorrect) qSuccessColor else qErrorColor),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = if (isCorrect) Icons.Default.Check else Icons.Default.Close,
                                        contentDescription = if (isCorrect) "Correct" else "Incorrect",
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Question ${qIdx + 1}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = if (isOfflineCsc) 14.sp else 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            Text(
                                text = question.domainName,
                                fontSize = if (isOfflineCsc) 12.sp else 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = if (isOfflineCsc) Modifier.weight(1f, fill = false) else Modifier,
                                maxLines = if (isOfflineCsc) 2 else 1
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = question.questionText,
                            fontSize = if (isOfflineCsc) 16.sp else 13.sp,
                            fontWeight = FontWeight.Medium,
                            lineHeight = if (isOfflineCsc) 23.sp else 18.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // User Answer
                        Text(
                            text = "Your Answer: " + (if (userChoice != null) question.options.getOrNull(userChoice) else "Unanswered"),
                            fontSize = if (isOfflineCsc) 14.sp else 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            lineHeight = 20.sp,
                            color = if (isCorrect) qSuccessColor else qErrorColor
                        )

                        if (!isCorrect) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Correct Answer: " + question.options[question.correctIndex],
                                fontSize = if (isOfflineCsc) 14.sp else 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                lineHeight = 20.sp,
                                color = qSuccessColor
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Explanation
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                .then(
                                    if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(10.dp)) else Modifier
                                )
                                .padding(12.dp)
                        ) {
                            Column {
                                Text(
                                    text = "Rationale:",
                                    fontSize = if (isOfflineCsc) 12.sp else 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = question.explanation,
                                    fontSize = if (isOfflineCsc) 14.sp else 12.sp,
                                    color = if (isOfflineCsc) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                                    lineHeight = if (isOfflineCsc) 20.sp else 16.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Grounded Source Citation
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isOfflineCsc) CscSelectedBg else AccentBlue.copy(alpha = 0.08f))
                                .then(
                                    if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(8.dp)) else Modifier
                                )
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = "Citation",
                                tint = citationColor,
                                modifier = Modifier.size(15.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Source: ${question.citation.title} (${question.citation.sectionOrPage})",
                                fontSize = if (isOfflineCsc) 13.sp else 11.sp,
                                lineHeight = 18.sp,
                                color = citationColor,
                                fontWeight = FontWeight.Medium,
                                maxLines = if (isOfflineCsc) Int.MAX_VALUE else 1
                            )
                        }

                        if (!isOfflineCsc) {
                            Spacer(modifier = Modifier.height(10.dp))

                            // Ask AI Tutor button
                            OutlinedButton(
                                onClick = {
                                    viewModel.sendAIPrompt("Can you deep-dive into Question ${qIdx + 1} regarding '${question.citation.standardOrFramework}' and explain why option ${if (userChoice != null) userChoice + 1 else 1} is incorrect?")
                                    viewModel.navigateTo(AppScreen.AI_TUTOR)
                                },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Psychology, contentDescription = "Ask AI", modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Ask AI Tutor to Analyze This Question", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

