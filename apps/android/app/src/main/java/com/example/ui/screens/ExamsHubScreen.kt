package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
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
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
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
import com.example.model.EvidenceConfidence
import com.example.model.ExamMode
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.AccentCyan
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
    val sessions by viewModel.sessions.collectAsState()
    val savedActiveAttempt by viewModel.savedActiveAttempt.collectAsState()
    val topicMasteryList by viewModel.topicMasteryList.collectAsState()
    val domainMasteryList by viewModel.domainMasteryList.collectAsState()
    val initialBaselineSession by viewModel.initialBaselineSession.collectAsState()
    val recommendations by viewModel.recommendations.collectAsState()
    val bankCoverageAudit by viewModel.bankCoverageAudit.collectAsState()

    val isOfflineCsc = com.example.BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-") ||
        currentExam.id.startsWith("csc-part-")
    val effectiveDomains = if (currentExam.domains.isNotEmpty()) {
        currentExam.domains
    } else {
        com.example.data.ExamCatalog.deriveDomainsFromQuestions(questions)
    }
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
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color(currentExam.primaryColorHex))
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = currentExam.shortCode,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Practice & Simulations",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${currentExam.title} • Pass Score ${currentExam.passingScorePercent}%",
                            fontSize = 12.sp,
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
                                .background(SuccessGreen.copy(alpha = 0.15f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text("OFFLINE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
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
                    colors = CardDefaults.cardColors(containerColor = AccentBlue.copy(alpha = 0.12f))
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Resume Saved Session", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = AccentBlue)
                            Text(
                                text = "Q ${active.currentIndex + 1}/$qTotal • ${String.format("%02d:%02d", minsLeft, secsLeft)} remaining",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Button(
                            onClick = { viewModel.resumeSavedSimulation() },
                            colors = ButtonDefaults.buttonColors(containerColor = AccentBlue)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Resume", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Section: Guided Offline Modes (Initial Assessment, Adaptive Practice, Retention Review)
        item {
            Text(
                text = "Study Modes",
                fontSize = 16.sp,
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
                elevation = CardDefaults.cardElevation(2.dp)
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
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.14f)),
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

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = if (initialBaselineSession == null) "Initial Assessment" else "Diagnostic Assessment Retake",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (initialBaselineSession != null) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(SuccessGreen.copy(alpha = 0.15f))
                                        .padding(horizontal = 6.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = "BASELINE ${initialBaselineSession!!.scorePercent}%",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = SuccessGreen
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = if (eligibleAssessmentCount > 0) {
                                val baselineNote = if (initialBaselineSession == null) {
                                    "Sets your fixed starting baseline across domains."
                                } else {
                                    "Creates a new diagnostic record; original baseline stays saved."
                                }
                                "${bankCoverageAudit.coverageDescription} $baselineNote"
                            } else {
                                "Practice questions are not installed yet for ${currentExam.shortCode}."
                            },
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = if (!isOfflineCsc || eligibleAssessmentCount > 0) MaterialTheme.colorScheme.primary else Slate400
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
                elevation = CardDefaults.cardElevation(2.dp)
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
                            .background(SuccessGreen.copy(alpha = 0.14f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Bolt, contentDescription = null, tint = SuccessGreen, modifier = Modifier.size(28.dp))
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Adaptive Practice",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = if (practiceEligibleCount > 0) {
                                topAdaptiveRec?.reason
                                    ?: "Targets weak and low-evidence topics with immediate feedback and follow-up review."
                            } else {
                                "Waiting for question bank installation."
                            },
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = if (!isOfflineCsc || practiceEligibleCount > 0) MaterialTheme.colorScheme.primary else Slate400
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
                elevation = CardDefaults.cardElevation(2.dp)
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
                            .background(WarningAmber.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.History, contentDescription = null, tint = WarningAmber, modifier = Modifier.size(26.dp))
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Retention Review",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (dueTopicsCount > 0) {
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(WarningAmber.copy(alpha = 0.18f))
                                        .padding(horizontal = 6.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = "$dueTopicsCount DUE",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = WarningAmber
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = when {
                                practiceEligibleCount <= 0 -> "Waiting for question bank installation."
                                dueTopicsCount > 0 -> "$dueTopicsCount topic(s) due for spaced retention check."
                                else -> "No items due for review yet — start a quick mixed check anytime."
                            },
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = if (!isOfflineCsc || practiceEligibleCount > 0) MaterialTheme.colorScheme.primary else Slate400
                    )
                }
            }
        }

        // 1. Full Exam Simulation (Timed, test conditions)
        item {
            val displayCount = questions.size.takeIf { it > 0 } ?: currentExam.totalBankQuestions
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("mode_full_simulation")
                    .clickable(enabled = !isOfflineCsc || questions.isNotEmpty()) {
                        viewModel.startSimulation(ExamMode.FULL_SIMULATION)
                    },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(2.dp)
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
                            .background(AccentBlue.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Timer, contentDescription = null, tint = AccentBlue, modifier = Modifier.size(28.dp))
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = if (displayCount > 0) "Full Timed Simulation ($displayCount Qs)" else "Timed Simulation (Not Installed)",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(if (isOfflineCsc) SuccessGreen else AccentBlue)
                                    .padding(horizontal = 6.dp, vertical = 1.dp)
                            ) {
                                Text(
                                    text = if (isOfflineCsc) "EXAM MODE" else "SAMPLE BANK",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = if (displayCount > 0) {
                                "$displayCount Qs • ${currentExam.durationMinutes} min • Strict exam conditions (answers revealed only on submit)"
                            } else {
                                "Practice questions are not installed yet for ${currentExam.shortCode}."
                            },
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = if (!isOfflineCsc || questions.isNotEmpty()) MaterialTheme.colorScheme.primary else Slate400
                    )
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
                elevation = CardDefaults.cardElevation(2.dp)
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
                            .background(AccentCyan.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Bolt, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(28.dp))
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Quick Practice Sprint",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (displayCount > 0) {
                                "Focused practice drill with immediate answer check & explanations"
                            } else {
                                "Waiting for question bank installation"
                            },
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = null,
                        tint = if (!isOfflineCsc || bankCoverageAudit.practiceEligibleCount > 0) MaterialTheme.colorScheme.primary else Slate400
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
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Tap to practice domain",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        if (effectiveDomains.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Text(
                        text = "Topic-specific drills will unlock automatically once CSC Part 1 questions are installed.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }

        items(effectiveDomains) { domain ->
            val domainMastery = domainMasteryById[domain.id]
            val statusSubtitle = when {
                domainMastery == null || !domainMastery.isAssessed ->
                    "Not assessed yet • ${domain.description}"
                else ->
                    "Mastery: ${domainMastery.masteryPercent}% (${domainMastery.confidence.displayLabel()}) • ${domainMastery.attemptCount} Qs answered"
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
                elevation = CardDefaults.cardElevation(1.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "D${domain.number}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Text(
                                text = domain.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = statusSubtitle,
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                maxLines = 1
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = if (domainMastery?.isWeak == true) "Strengthen" else "Start Drill",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }

        // Section: Topic Practice Targets
        if (topicMasteryList.isNotEmpty()) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Topic Practice Targets (${topicMasteryList.size})",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            items(topicMasteryList.take(10)) { topic ->
                val badgeText = when {
                    !topic.isAssessed -> "Not assessed"
                    topic.confidence == EvidenceConfidence.INSUFFICIENT_EVIDENCE -> "${topic.masteryPercent}% • Insufficient evidence"
                    topic.masteryPercent < 65 -> "${topic.masteryPercent}% • Needs work"
                    topic.masteryPercent >= 80 -> "${topic.masteryPercent}% • Strong"
                    else -> "${topic.masteryPercent}% • Practicing"
                }
                val badgeColor = when {
                    !topic.isAssessed -> Slate400
                    topic.masteryPercent < 65 -> ErrorRed
                    topic.masteryPercent < 80 -> WarningAmber
                    else -> SuccessGreen
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
                    elevation = CardDefaults.cardElevation(1.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = topic.topicName,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "${topic.domainName} • ${topic.attemptCount} answered",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(badgeColor.copy(alpha = 0.14f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = badgeText,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = badgeColor
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
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Tap attempt to review",
                    fontSize = 11.sp,
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
                elevation = CardDefaults.cardElevation(1.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(if (passed) SuccessGreen else ErrorRed)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = modeLabel,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                        Text(
                            text = "${session.totalQuestions} Questions • ${session.durationSeconds / 60} min spent",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Text(
                        text = "${session.scorePercent}%",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (passed) SuccessGreen else ErrorRed
                    )
                }
            }
        }
    }
}

