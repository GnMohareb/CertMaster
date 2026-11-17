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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.EvidenceConfidence
import com.example.model.ExamMode
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.AccentCyan
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
import com.example.ui.theme.CscTextPrimary
import com.example.ui.theme.CscTextSecondary
import com.example.ui.theme.CscWarmBackground
import com.example.ui.theme.CscWarningBg
import com.example.ui.theme.CscWarningBorder
import com.example.ui.theme.CscWarningDark
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.Slate400
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WarningAmber

@Composable
fun ExamsHubScreen(
    viewModel: ExamViewModel,
    modifier: Modifier = Modifier
) {
    val currentExam by viewModel.currentExam.collectAsState()
    val questions by viewModel.questions.collectAsState()
    val questionExposures by viewModel.questionExposures.collectAsState()
    val sessions by viewModel.sessions.collectAsState()
    val savedActiveAttempt by viewModel.savedActiveAttempt.collectAsState()
    val topicMasteryList by viewModel.topicMasteryList.collectAsState()
    val domainMasteryList by viewModel.domainMasteryList.collectAsState()
    val initialBaselineSession by viewModel.initialBaselineSession.collectAsState()
    val recommendations by viewModel.recommendations.collectAsState()
    val bankMetadata by viewModel.bankMetadata.collectAsState()
    val bankCoverageAudit by viewModel.bankCoverageAudit.collectAsState()

    var expandedDomainId by remember { mutableStateOf<String?>(null) }
    var showAllTopics by remember { mutableStateOf(false) }

    val isOfflineCsc = com.example.BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-") ||
        currentExam.id.startsWith("csc-part-")
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
    val topicsByDomain = topicMasteryList.groupBy { it.domainId }
    val domainMasteryById = domainMasteryList.associateBy { it.domainId }
    val nowMillis = System.currentTimeMillis()
    val dueTopicsCount = topicMasteryList.count {
        it.isAssessed && it.nextReviewDueAtMillis in 1L..nowMillis
    }
    val topAdaptiveRec = recommendations.firstOrNull {
        it.mode == ExamMode.AI_ADAPTIVE_DRILL || it.mode == ExamMode.RETENTION_REVIEW
    } ?: recommendations.firstOrNull()

    BackHandler {
        viewModel.navigateTo(AppScreen.DASHBOARD)
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 12.dp, bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header with Active Exam & Switcher
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("exams_hub_header"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = cardBorder,
                elevation = cardElevationPrimary
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isOfflineCsc) CscSelectedBg else Color(currentExam.primaryColorHex))
                                    .then(
                                        if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(6.dp)) else Modifier
                                    )
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = currentExam.shortCode,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isOfflineCsc) CscPrimaryBlue else Color.White
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Practice & Simulations",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "${currentExam.title} • Pass Score ${currentExam.passingScorePercent}%",
                            fontSize = 13.sp,
                            lineHeight = 18.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    if (!isOfflineCsc) {
                        OutlinedButton(
                            onClick = { viewModel.navigateTo(AppScreen.EXAM_SELECTOR) },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                            modifier = Modifier.testTag("btn_switch_bank")
                        ) {
                            Icon(Icons.Default.SwapHoriz, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("112 Banks", fontSize = 11.sp)
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(CscSuccessBg)
                                .border(1.dp, CscSuccessBorder, RoundedCornerShape(6.dp))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text("OFFLINE", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = CscSuccessDark)
                        }
                    }
                }
            }
        }

        if (savedActiveAttempt != null && questions.isNotEmpty()) {
            val active = savedActiveAttempt!!
            val qTotal = active.parseQuestionIds().size
            val minsLeft = active.remainingSeconds / 60
            val secsLeft = active.remainingSeconds % 60
            item {
                Card(
                    modifier = Modifier.fillMaxWidth().testTag("hub_resume_card"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isOfflineCsc) CscSelectedBg else AccentBlue.copy(alpha = 0.12f)
                    ),
                    border = if (isOfflineCsc) BorderStroke(1.5.dp, CscPrimaryBlue) else null
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f).padding(end = 10.dp)) {
                            Text(
                                text = "Resume Saved Session",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = primaryAccent
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Q ${active.currentIndex + 1}/$qTotal • ${String.format("%02d:%02d", minsLeft, secsLeft)} remaining",
                                fontSize = 13.sp,
                                color = if (isOfflineCsc) CscTextPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Button(
                            onClick = { viewModel.resumeSavedSimulation() },
                            colors = ButtonDefaults.buttonColors(containerColor = primaryAccent, contentColor = Color.White),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.heightIn(min = 48.dp)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Resume", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Section: Guided Offline Modes (Initial Assessment, Adaptive Practice, Retention Review)
        item {
            Text(
                text = "Study Modes",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
        }

        // 0a. Initial Assessment (Fixed Baseline + Balanced/Weighted Coverage)
        item {
            val eligibleAssessmentCount = bankCoverageAudit.assessmentEligibleCount
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("mode_initial_assessment")
                    .clickable(enabled = !isOfflineCsc || eligibleAssessmentCount > 0) {
                        viewModel.startSimulation(ExamMode.INITIAL_BEHAVIORAL_ASSESSMENT)
                    },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = cardBorder,
                elevation = cardElevationPrimary
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .background(if (isOfflineCsc) CscSelectedBg else MaterialTheme.colorScheme.primary.copy(alpha = 0.14f))
                            .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, CircleShape) else Modifier),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Assessment,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(26.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                        Text(
                            text = if (initialBaselineSession == null) "Initial Assessment" else "Diagnostic Assessment Retake",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (initialBaselineSession != null) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isOfflineCsc) CscSuccessBg else SuccessGreen.copy(alpha = 0.15f))
                                    .then(if (isOfflineCsc) Modifier.border(1.dp, CscSuccessBorder, RoundedCornerShape(6.dp)) else Modifier)
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "BASELINE ${initialBaselineSession!!.scorePercent}%",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = successAccent
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (eligibleAssessmentCount > 0) {
                                val baselineNote = if (initialBaselineSession == null) {
                                    "Sets your fixed starting baseline across domains."
                                } else {
                                    "Creates a new diagnostic record; original baseline stays saved."
                                }
                                if (bankMetadata.diagnosticQuestionIds.isNotEmpty()) {
                                    "${bankMetadata.diagnosticQuestionIds.size} diagnostic questions across domains. $baselineNote"
                                } else {
                                    "${bankCoverageAudit.coverageDescription} $baselineNote"
                                }
                            } else {
                                "Practice questions are not installed yet for ${currentExam.shortCode}."
                            },
                            fontSize = 13.sp,
                            lineHeight = 19.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = if (!isOfflineCsc || eligibleAssessmentCount > 0) MaterialTheme.colorScheme.primary else (if (isOfflineCsc) CscTextSecondary else Slate400)
                    )
                }
            }
        }

        // 0b. Adaptive Practice (Weak Topics + Insufficient Evidence + Immediate Feedback)
        item {
            val practiceEligibleCount = bankCoverageAudit.practiceEligibleCount
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("mode_adaptive_practice")
                    .clickable(enabled = !isOfflineCsc || practiceEligibleCount > 0) {
                        viewModel.startAdaptivePractice()
                    },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = cardBorder,
                elevation = cardElevationPrimary
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .background(if (isOfflineCsc) CscSuccessBg else SuccessGreen.copy(alpha = 0.14f))
                            .then(if (isOfflineCsc) Modifier.border(1.dp, CscSuccessBorder, CircleShape) else Modifier),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Bolt, contentDescription = null, tint = successAccent, modifier = Modifier.size(28.dp))
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                        Text(
                            text = "Adaptive Practice",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (practiceEligibleCount > 0) {
                                topAdaptiveRec?.reason
                                    ?: "Targets weak and low-evidence topics with immediate feedback and follow-up review."
                            } else {
                                "Waiting for question bank installation."
                            },
                            fontSize = 13.sp,
                            lineHeight = 19.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = if (!isOfflineCsc || practiceEligibleCount > 0) MaterialTheme.colorScheme.primary else (if (isOfflineCsc) CscTextSecondary else Slate400)
                    )
                }
            }
        }

        // 0c. Retention Review (Spaced Schedule)
        item {
            val practiceEligibleCount = bankCoverageAudit.practiceEligibleCount
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("mode_retention_review")
                    .clickable(enabled = (!isOfflineCsc || practiceEligibleCount > 0)) {
                        viewModel.startAdaptivePractice(mode = ExamMode.RETENTION_REVIEW)
                    },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = cardBorder,
                elevation = cardElevationPrimary
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .background(if (isOfflineCsc) CscWarningBg else WarningAmber.copy(alpha = 0.15f))
                            .then(if (isOfflineCsc) Modifier.border(1.dp, CscWarningBorder, CircleShape) else Modifier),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.History, contentDescription = null, tint = warningAccent, modifier = Modifier.size(26.dp))
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Retention Review",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (dueTopicsCount > 0) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isOfflineCsc) CscWarningBg else WarningAmber.copy(alpha = 0.18f))
                                        .then(if (isOfflineCsc) Modifier.border(1.dp, CscWarningBorder, RoundedCornerShape(6.dp)) else Modifier)
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "$dueTopicsCount DUE",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = warningAccent
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = when {
                                practiceEligibleCount <= 0 -> "Waiting for question bank installation."
                                dueTopicsCount > 0 -> "$dueTopicsCount topic(s) due for spaced retention check."
                                else -> "No items due for review yet — start a quick mixed check anytime."
                            },
                            fontSize = 13.sp,
                            lineHeight = 19.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = if (!isOfflineCsc || practiceEligibleCount > 0) MaterialTheme.colorScheme.primary else (if (isOfflineCsc) CscTextSecondary else Slate400)
                    )
                }
            }
        }

        // 1. Full Exam Simulation (Timed, exam conditions — 100-question Exam 1 style papers)
        item {
            val simulationPapers = bankMetadata.simulationPapers
            val hasReservedMockBank = bankCoverageAudit.reservedFullExamCount > 0
            val hasSimulationPapers = simulationPapers.isNotEmpty()
            val fullSimEnabled = !isOfflineCsc || hasReservedMockBank || hasSimulationPapers
            val displayCount = when {
                hasSimulationPapers -> simulationPapers.first().questionIds.size
                isOfflineCsc -> bankCoverageAudit.reservedFullExamCount
                else -> questions.size.takeIf { it > 0 } ?: currentExam.totalBankQuestions
            }
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("mode_full_simulation")
                    .clickable(enabled = fullSimEnabled) {
                        viewModel.startSimulation(ExamMode.FULL_SIMULATION)
                    },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = cardBorder,
                elevation = cardElevationPrimary
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(
                                    if (isOfflineCsc) {
                                        if (fullSimEnabled) CscSelectedBg else CscCreamSecondary
                                    } else {
                                        (if (fullSimEnabled) AccentBlue else Slate400).copy(alpha = 0.15f)
                                    }
                                )
                                .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, CircleShape) else Modifier),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                Icons.Default.Timer,
                                contentDescription = null,
                                tint = if (fullSimEnabled) primaryAccent else (if (isOfflineCsc) CscTextSecondary else Slate400),
                                modifier = Modifier.size(28.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                            Text(
                                text = when {
                                    hasSimulationPapers -> "Timed Practice Simulations (${simulationPapers.size} Papers)"
                                    displayCount > 0 -> "Full Timed Simulation ($displayCount Qs)"
                                    isOfflineCsc && questions.isNotEmpty() -> "Full Timed Exam Simulation"
                                    else -> "Timed Simulation (Not Installed)"
                                },
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (fullSimEnabled) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(
                                        if (isOfflineCsc) {
                                            if (!hasReservedMockBank && !hasSimulationPapers) CscWarningBg else CscSelectedBg
                                        } else {
                                            when {
                                                isOfflineCsc && !hasReservedMockBank && !hasSimulationPapers -> WarningAmber
                                                isOfflineCsc -> SuccessGreen
                                                else -> AccentBlue
                                            }
                                        }
                                    )
                                    .then(
                                        if (isOfflineCsc) {
                                            Modifier.border(
                                                1.dp,
                                                if (!hasReservedMockBank && !hasSimulationPapers) CscWarningBorder else CscBorder,
                                                RoundedCornerShape(6.dp)
                                            )
                                        } else Modifier
                                    )
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = when {
                                        isOfflineCsc && !hasReservedMockBank && !hasSimulationPapers -> "COMING SOON"
                                        isOfflineCsc -> "EXAM MODE"
                                        else -> "SAMPLE BANK"
                                    },
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isOfflineCsc) {
                                        if (!hasReservedMockBank && !hasSimulationPapers) CscWarningDark else CscPrimaryBlue
                                    } else {
                                        Color.White
                                    }
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = when {
                                    hasSimulationPapers ->
                                        "${simulationPapers.size} practice simulations • $displayCount Qs each • ${simulationPapers.first().durationMinutes} min • Questions also appear in topic practice; scores are not unseen readiness estimates. Answers on submit."
                                    displayCount > 0 ->
                                        "$displayCount Qs • ${currentExam.durationMinutes} min • Strict exam conditions (answers revealed only on submit)"
                                    isOfflineCsc && questions.isNotEmpty() ->
                                        "Dedicated timed mock exams are coming separately. Use Topic & Domain Practice above (${questions.size} Qs)."
                                    else ->
                                        "Practice questions are not installed yet for ${currentExam.shortCode}."
                                },
                                fontSize = 13.sp,
                                lineHeight = 19.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Icon(
                            Icons.Default.ArrowForward,
                            contentDescription = null,
                            tint = if (fullSimEnabled) MaterialTheme.colorScheme.primary else (if (isOfflineCsc) CscTextSecondary else Slate400)
                        )
                    }

                    if (hasSimulationPapers) {
                        Spacer(modifier = Modifier.height(14.dp))
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isOfflineCsc) CscCreamSecondary else AccentBlue.copy(alpha = 0.06f))
                                .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(12.dp)) else Modifier)
                        ) {
                            simulationPapers.forEachIndexed { idx, paper ->
                                val overlapCount = paper.questionIds.count { (questionExposures[it]?.exposureCount ?: 0) > 0 }
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .heightIn(min = 56.dp)
                                        .clickable { viewModel.startSimulationPaper(paper.id) }
                                        .padding(horizontal = 14.dp, vertical = 12.dp)
                                        .testTag("simulation_paper_${paper.id}"),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f).padding(end = 10.dp)) {
                                        Text(
                                            text = paper.title,
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            text = "${paper.questionIds.size} Qs • ${paper.durationMinutes} min • $overlapCount previously practised",
                                            fontSize = 13.sp,
                                            lineHeight = 18.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = "Start Exam",
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = primaryAccent
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Icon(
                                            Icons.Default.PlayArrow,
                                            contentDescription = null,
                                            tint = primaryAccent,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }
                                }
                                if (idx < simulationPapers.lastIndex) {
                                    HorizontalDivider(
                                        thickness = 1.dp,
                                        color = if (isOfflineCsc) CscBorder else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. Quick Practice Sprint
        item {
            val displayCount = bankCoverageAudit.practiceEligibleCount.takeIf { it > 0 } ?: currentExam.totalBankQuestions
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("mode_quick_sprint")
                    .clickable(enabled = !isOfflineCsc || bankCoverageAudit.practiceEligibleCount > 0) {
                        viewModel.startSimulation(ExamMode.DOMAIN_PRACTICE)
                    },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = cardBorder,
                elevation = cardElevationPrimary
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(50.dp)
                            .clip(CircleShape)
                            .background(if (isOfflineCsc) CscCreamSecondary else AccentCyan.copy(alpha = 0.15f))
                            .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, CircleShape) else Modifier),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Bolt,
                            contentDescription = null,
                            tint = if (isOfflineCsc) CscPrimaryBlue else AccentCyan,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                        Text(
                            text = "Quick Practice Sprint",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (displayCount > 0) {
                                "Focused practice drill with immediate answer check & explanations"
                            } else {
                                "Waiting for question bank installation"
                            },
                            fontSize = 13.sp,
                            lineHeight = 19.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = if (!isOfflineCsc || bankCoverageAudit.practiceEligibleCount > 0) MaterialTheme.colorScheme.primary else (if (isOfflineCsc) CscTextSecondary else Slate400)
                    )
                }
            }
        }

        // Section: Domain Focused Practice
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Domain-Specific Practice",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Tap to practice",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        if (effectiveDomains.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = cardBorder
                ) {
                    Text(
                        text = "Topic-specific drills will unlock automatically once CSC Part 1 questions are installed.",
                        fontSize = 13.sp,
                        lineHeight = 19.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }

        items(effectiveDomains) { domain ->
            val domainMastery = domainMasteryById[domain.id]
            val domainTopics = topicsByDomain[domain.id].orEmpty().sortedBy { it.topicKey }
            val isExpanded = expandedDomainId == domain.id
            val statusSubtitle = when {
                domainMastery == null || !domainMastery.isAssessed ->
                    "${domain.weightPercent}% Exam 1 wt • ${domain.description}"
                else ->
                    "Mastery: ${domainMastery.masteryPercent}% (${domainMastery.confidence.displayLabel()}) • ${domainMastery.attemptCount} Qs"
            }

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .clickable(enabled = !isOfflineCsc || questions.any { it.domainId == domain.id }) {
                        viewModel.startSimulation(ExamMode.DOMAIN_PRACTICE, domain.id)
                    }
                    .testTag("domain_practice_${domain.id}"),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = cardBorder,
                elevation = cardElevationSecondary
            ) {
                Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier.weight(1f),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant)
                                    .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(8.dp)) else Modifier),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "D${domain.number}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Text(
                                    text = domain.title,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = statusSubtitle,
                                    fontSize = 13.sp,
                                    lineHeight = 18.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 3
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        Column(horizontalAlignment = Alignment.End) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isOfflineCsc) CscSelectedBg else MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
                                    .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(6.dp)) else Modifier)
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = if (domainMastery?.isWeak == true) "Strengthen" else "Start Drill",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                            if (domainTopics.isNotEmpty()) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Box(
                                    modifier = Modifier
                                        .heightIn(min = 36.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant)
                                        .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(6.dp)) else Modifier)
                                        .clickable {
                                            expandedDomainId = if (isExpanded) null else domain.id
                                        }
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                        .testTag("toggle_domain_topics_${domain.id}"),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = if (isExpanded) "Hide Topics ▲" else "${domainTopics.size} Topics ▼",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (isOfflineCsc) CscTextPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }

                    if (isExpanded && domainTopics.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isOfflineCsc) CscWarmBackground else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f))
                                .then(if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(10.dp)) else Modifier)
                        ) {
                            domainTopics.forEachIndexed { idx, topic ->
                                val tBadge = when {
                                    !topic.isAssessed -> "Practice"
                                    topic.masteryPercent < 65 -> "${topic.masteryPercent}% • Weak"
                                    topic.masteryPercent >= 80 -> "${topic.masteryPercent}% • Strong"
                                    else -> "${topic.masteryPercent}%"
                                }
                                val tBadgeColor = when {
                                    !topic.isAssessed -> primaryAccent
                                    topic.masteryPercent < 65 -> errorAccent
                                    topic.masteryPercent >= 80 -> successAccent
                                    else -> warningAccent
                                }
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .heightIn(min = 48.dp)
                                        .clickable {
                                            viewModel.startAdaptivePractice(topicFilterKey = topic.topicKey)
                                        }
                                        .padding(horizontal = 12.dp, vertical = 10.dp)
                                        .testTag("domain_topic_item_${topic.topicKey}"),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = topic.topicName,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        modifier = Modifier.weight(1f).padding(end = 8.dp)
                                    )
                                    Text(
                                        text = tBadge,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = tBadgeColor
                                    )
                                }
                                if (idx < domainTopics.lastIndex) {
                                    HorizontalDivider(
                                        thickness = 1.dp,
                                        color = if (isOfflineCsc) CscBorder else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Section: Topic Practice Targets
        if (topicMasteryList.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Topic Practice Targets (${topicMasteryList.size})",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    if (topicMasteryList.size > 10) {
                        TextButton(onClick = { showAllTopics = !showAllTopics }) {
                            Text(
                                text = if (showAllTopics) "Show Top 10" else "Show All ${topicMasteryList.size}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            val visibleTopics = if (showAllTopics) topicMasteryList else topicMasteryList.take(10)
            items(visibleTopics) { topic ->
                val badgeText = when {
                    !topic.isAssessed -> "Not assessed"
                    topic.confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE -> "${topic.masteryPercent}% • Insufficient evidence"
                    topic.masteryPercent < 65 -> "${topic.masteryPercent}% • Needs work"
                    topic.masteryPercent >= 80 -> "${topic.masteryPercent}% • Strong"
                    else -> "${topic.masteryPercent}% • Practicing"
                }
                val badgeTextColor = when {
                    !topic.isAssessed -> if (isOfflineCsc) CscTextSecondary else Slate400
                    topic.masteryPercent < 65 -> errorAccent
                    topic.masteryPercent < 80 -> warningAccent
                    else -> successAccent
                }
                val badgeBg = when {
                    !isOfflineCsc -> badgeTextColor.copy(alpha = 0.14f)
                    !topic.isAssessed -> CscCreamSecondary
                    topic.masteryPercent < 65 -> CscErrorBg
                    topic.masteryPercent < 80 -> CscWarningBg
                    else -> CscSuccessBg
                }
                val badgeBorder = when {
                    !topic.isAssessed -> CscBorder
                    topic.masteryPercent < 65 -> CscErrorBorder
                    topic.masteryPercent < 80 -> CscWarningBorder
                    else -> CscSuccessBorder
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .clickable {
                            viewModel.startAdaptivePractice(topicFilterKey = topic.topicKey)
                        }
                        .testTag("topic_target_${topic.topicKey}"),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = cardBorder,
                    elevation = cardElevationSecondary
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                            Text(
                                text = topic.topicName,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "${topic.domainName} • ${topic.attemptCount} answered",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(badgeBg)
                                .then(if (isOfflineCsc) Modifier.border(1.dp, badgeBorder, RoundedCornerShape(6.dp)) else Modifier)
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = badgeText,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = badgeTextColor
                            )
                        }
                    }
                }
            }
        }

        // Past Simulation History
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Simulation History (${sessions.size})",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Tap to review",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        items(sessions) { session ->
            val passed = session.isPassed
            val modeLabel = when {
                session.isInitialBaseline -> "INITIAL BASELINE"
                else -> session.mode.name.replace("_", " ")
            }
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .clickable { viewModel.openHistoricalSession(session) },
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = cardBorder,
                elevation = cardElevationSecondary
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(if (passed) successAccent else errorAccent)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = modeLabel,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "${session.totalQuestions} Questions • ${session.durationSeconds / 60} min spent",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Text(
                        text = "${session.scorePercent}%",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (passed) successAccent else errorAccent
                    )
                }
            }
        }
    }
}


