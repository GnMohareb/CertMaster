package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FormatStrikethrough
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.domain.AdaptivePracticeEngine
import com.example.model.PracticeAnswerFeedback
import com.example.model.Question
import com.example.ui.ExamViewModel
import com.example.ui.theme.AccentBlue
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
import com.example.ui.theme.CscWarmBackground
import com.example.ui.theme.CscWarningBg
import com.example.ui.theme.CscWarningBorder
import com.example.ui.theme.CscWarningDark
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.Slate400
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WarningAmber

private enum class MatrixFilter {
    ALL, ANSWERED, UNANSWERED, FLAGGED
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExamSimulationScreen(
    viewModel: ExamViewModel,
    modifier: Modifier = Modifier
) {
    val questions by viewModel.simulationQuestions.collectAsState()
    val currentIndex by viewModel.currentQuestionIndex.collectAsState()
    val userAnswers by viewModel.userAnswers.collectAsState()
    val flaggedIndices by viewModel.flaggedIndices.collectAsState()
    val struckOptionsMap by viewModel.struckOptions.collectAsState()
    val remainingSeconds by viewModel.remainingSeconds.collectAsState()
    val isTimerPaused by viewModel.isTimerPaused.collectAsState()
    val activeMode by viewModel.activeMode.collectAsState()
    val checkedIndices by viewModel.checkedQuestionIndices.collectAsState()
    val practiceFeedback by viewModel.currentPracticeFeedback.collectAsState()
    val selectionReasons by viewModel.selectionReasons.collectAsState()
    val exhaustionNotice by viewModel.practiceExhaustionNotice.collectAsState()
    val activeSimulationPaperTitle by viewModel.activeSimulationPaperTitle.collectAsState()
    val isAdaptivePractice = AdaptivePracticeEngine.isAdaptivePracticeMode(activeMode)

    var showQuestionGridSheet by remember { mutableStateOf(false) }
    var showConfirmFinishDialog by remember { mutableStateOf(false) }
    var showExitWarningDialog by remember { mutableStateOf(false) }
    var showPauseDialog by remember { mutableStateOf(false) }
    var matrixFilter by remember { mutableStateOf(MatrixFilter.ALL) }

    val ribbonListState = rememberLazyListState()

    // Keep horizontal quick-jump ribbon centered on current question
    LaunchedEffect(currentIndex) {
        if (questions.isNotEmpty() && currentIndex in questions.indices) {
            val targetOffset = (currentIndex - 2).coerceAtLeast(0)
            ribbonListState.animateScrollToItem(targetOffset)
        }
    }

    // Intercept hardware/gesture back to prevent accidental loss
    BackHandler {
        showExitWarningDialog = true
    }

    if (questions.isEmpty()) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "No questions available for this simulation session.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        return
    }

    val currentQ = questions.getOrNull(currentIndex) ?: questions.first()
    val isFlagged = flaggedIndices.contains(currentIndex)
    val selectedOptionIndex = userAnswers[currentIndex]
    val struckForQuestion = struckOptionsMap[currentIndex] ?: emptySet()

    // Format timer HH:MM:SS or MM:SS
    val hours = remainingSeconds / 3600
    val minutes = (remainingSeconds % 3600) / 60
    val seconds = remainingSeconds % 60
    val timeFormatted = if (hours > 0) {
        String.format("%02d:%02d:%02d", hours, minutes, seconds)
    } else {
        String.format("%02d:%02d", minutes, seconds)
    }

    val isCsc = com.example.BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-")
    val successAccent = if (isCsc) CscSuccessDark else SuccessGreen
    val warningAccent = if (isCsc) CscWarningDark else WarningAmber
    val errorAccent = if (isCsc) CscErrorDark else ErrorRed

    val timerColor = when {
        remainingSeconds < 300 -> errorAccent
        remainingSeconds < 600 -> warningAccent
        else -> MaterialTheme.colorScheme.primary
    }
    val timerBgColor = when {
        !isCsc -> timerColor.copy(alpha = 0.12f)
        remainingSeconds < 300 -> CscErrorBg
        remainingSeconds < 600 -> CscWarningBg
        else -> CscCreamSecondary
    }
    val timerBorderColor = when {
        remainingSeconds < 300 -> CscErrorBorder
        remainingSeconds < 600 -> CscWarningBorder
        else -> CscBorder
    }

    val answeredCount = userAnswers.size
    val totalCount = questions.size
    val unansweredCount = totalCount - answeredCount
    val completionFraction = (answeredCount.toFloat() / totalCount.coerceAtLeast(1)).coerceIn(0f, 1f)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // --- TOP BAR: Header & Exam Session Status ---
        TopAppBar(
            title = {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Question ${currentIndex + 1}",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = " of $totalCount",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Text(
                        text = if (!activeSimulationPaperTitle.isNullOrBlank()) {
                            "$activeSimulationPaperTitle • ${currentQ.domainName}"
                        } else {
                            currentQ.domainName
                        },
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.primary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            },
            actions = {
                // Interactive Countdown Timer Pill
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = timerBgColor,
                    border = if (isCsc) BorderStroke(1.dp, timerBorderColor) else null,
                    modifier = Modifier
                        .heightIn(min = 38.dp)
                        .clickable {
                            viewModel.pauseTimer()
                            showPauseDialog = true
                        }
                        .testTag("timer_chip")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Icon(
                            imageVector = if (isTimerPaused) Icons.Default.Pause else Icons.Default.Timer,
                            contentDescription = if (isTimerPaused) "Timer Paused" else "Countdown Timer",
                            tint = timerColor,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = timeFormatted,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = timerColor
                        )
                    }
                }

                // Pause Action Button
                IconButton(
                    onClick = {
                        viewModel.pauseTimer()
                        showPauseDialog = true
                    },
                    modifier = Modifier.testTag("btn_pause_exam")
                ) {
                    Icon(
                        imageVector = if (isTimerPaused) Icons.Default.PlayArrow else Icons.Default.Pause,
                        contentDescription = "Pause Exam",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Flag Question for Review Toggle
                IconButton(
                    onClick = { viewModel.toggleFlagQuestion(currentIndex) },
                    modifier = Modifier.testTag("flag_button")
                ) {
                    Icon(
                        imageVector = if (isFlagged) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = if (isFlagged) "Unmark Review" else "Mark for Review",
                        tint = if (isFlagged) warningAccent else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Question Matrix Sheet Opener
                IconButton(
                    onClick = { showQuestionGridSheet = true },
                    modifier = Modifier.testTag("grid_nav_button")
                ) {
                    Box(contentAlignment = Alignment.TopEnd) {
                        Icon(
                            imageVector = Icons.Default.GridView,
                            contentDescription = "Question Matrix Overview",
                            tint = MaterialTheme.colorScheme.primary
                        )
                        if (flaggedIndices.isNotEmpty()) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(warningAccent)
                            )
                        }
                    }
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        )
        if (isCsc) {
            HorizontalDivider(thickness = 1.dp, color = CscBorder)
        }

        // --- PROGRESS TRACKING SECTION ---
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            // Linear progress indicator
            LinearProgressIndicator(
                progress = { completionFraction },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .testTag("progress_bar"),
                color = MaterialTheme.colorScheme.primary,
                trackColor = if (isCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Progress status pills
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Answered Count Pill
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(successAccent)
                        )
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = "$answeredCount Answered",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    // Flagged Count Pill
                    if (flaggedIndices.isNotEmpty()) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(warningAccent)
                            )
                            Spacer(modifier = Modifier.width(5.dp))
                            Text(
                                text = "${flaggedIndices.size} Flagged",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Unanswered Count Pill
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(if (isCsc) CscTextSecondary else Slate400)
                        )
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = "$unansweredCount Remaining",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Completion percentage
                Text(
                    text = "${(completionFraction * 100).toInt()}% Done",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        // --- HORIZONTAL QUICK-JUMP NAVIGATION RIBBON ---
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = if (isCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
            tonalElevation = if (isCsc) 0.dp else 1.dp
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                if (isCsc) {
                    HorizontalDivider(thickness = 1.dp, color = CscBorder)
                }
                LazyRow(
                    state = ribbonListState,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .testTag("question_quick_ribbon"),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp)
                ) {
                    items(totalCount) { qIndex ->
                        val isCurrent = qIndex == currentIndex
                        val isAnswered = userAnswers.containsKey(qIndex)
                        val isFlaggedItem = flaggedIndices.contains(qIndex)

                        val pillBg = if (isCsc) {
                            when {
                                isCurrent -> CscPrimaryBlue
                                isFlaggedItem -> CscWarningBg
                                isAnswered -> CscSuccessBg
                                else -> CscCardSurface
                            }
                        } else {
                            when {
                                isCurrent -> MaterialTheme.colorScheme.primary
                                isFlaggedItem -> WarningAmber.copy(alpha = 0.2f)
                                isAnswered -> SuccessGreen.copy(alpha = 0.15f)
                                else -> MaterialTheme.colorScheme.surface
                            }
                        }

                        val pillBorderColor = if (isCsc) {
                            when {
                                isCurrent -> CscPrimaryBlue
                                isFlaggedItem -> CscWarningBorder
                                isAnswered -> CscSuccessBorder
                                else -> CscBorder
                            }
                        } else {
                            when {
                                isCurrent -> MaterialTheme.colorScheme.primary
                                isFlaggedItem -> WarningAmber
                                isAnswered -> SuccessGreen
                                else -> MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)
                            }
                        }

                        val textColor = when {
                            isCurrent -> MaterialTheme.colorScheme.onPrimary
                            isFlaggedItem -> warningAccent
                            isAnswered -> successAccent
                            else -> MaterialTheme.colorScheme.onSurfaceVariant
                        }

                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = pillBg,
                            border = BorderStroke(1.dp, pillBorderColor),
                            modifier = Modifier
                                .size(width = 48.dp, height = 40.dp)
                                .clickable { viewModel.goToQuestion(qIndex) }
                                .testTag("ribbon_item_$qIndex")
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    Text(
                                        text = "${qIndex + 1}",
                                        fontSize = 13.sp,
                                        fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Medium,
                                        color = textColor
                                    )
                                    if (isFlaggedItem && !isCurrent) {
                                        Spacer(modifier = Modifier.width(3.dp))
                                        Box(
                                            modifier = Modifier
                                                .size(5.dp)
                                                .clip(CircleShape)
                                                .background(warningAccent)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                if (isCsc) {
                    HorizontalDivider(thickness = 1.dp, color = CscBorder)
                }
            }
        }

        // --- ANIMATED QUESTION CARD CONTAINER ---
        AnimatedContent(
            targetState = currentIndex,
            transitionSpec = {
                if (targetState > initialState) {
                    (slideInHorizontally { width -> width } + fadeIn()).togetherWith(
                        slideOutHorizontally { width -> -width } + fadeOut()
                    )
                } else {
                    (slideInHorizontally { width -> -width } + fadeIn()).togetherWith(
                        slideOutHorizontally { width -> width } + fadeOut()
                    )
                }
            },
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            label = "QuestionCardTransition"
        ) { targetIndex ->
            val activeQuestion = questions.getOrNull(targetIndex) ?: currentQ
            val activeSelectedOption = userAnswers[targetIndex]
            val activeStruck = struckOptionsMap[targetIndex] ?: emptySet()
            val isChecked = isAdaptivePractice && checkedIndices.contains(targetIndex)
            val feedbackForCard = if (isChecked && practiceFeedback?.questionIndex == targetIndex) {
                practiceFeedback
            } else {
                null
            }

            QuestionCardContent(
                question = activeQuestion,
                questionIndex = targetIndex,
                selectedOptionIndex = activeSelectedOption,
                struckOptions = activeStruck,
                isAdaptivePractice = isAdaptivePractice,
                isChecked = isChecked,
                selectionReason = selectionReasons[activeQuestion.id],
                exhaustionNotice = if (targetIndex == 0) exhaustionNotice else null,
                practiceFeedback = feedbackForCard,
                onSelectOption = { optIdx -> viewModel.selectOption(targetIndex, optIdx) },
                onToggleStrike = { optIdx -> viewModel.toggleStrikeOption(targetIndex, optIdx) },
                onCheckAnswer = { viewModel.checkPracticeAnswer(targetIndex) }
            )
        }

        // --- BOTTOM NAVIGATION BAR ---
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(topStart = if (isCsc) 0.dp else 16.dp, topEnd = if (isCsc) 0.dp else 16.dp),
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = if (isCsc) 0.dp else 8.dp
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                if (isCsc) {
                    HorizontalDivider(thickness = 1.dp, color = CscBorder)
                }
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                ) {
                    // Secondary Control Row: Review Matrix trigger & question index
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Question ${currentIndex + 1} of $totalCount",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        OutlinedButton(
                            onClick = { showQuestionGridSheet = true },
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(1.dp, if (isCsc) CscBorder else MaterialTheme.colorScheme.outline),
                            colors = if (isCsc) {
                                ButtonDefaults.outlinedButtonColors(
                                    containerColor = CscCardSurface,
                                    contentColor = CscPrimaryBlue
                                )
                            } else {
                                ButtonDefaults.outlinedButtonColors()
                            },
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                            modifier = Modifier
                                .heightIn(min = 38.dp)
                                .testTag("btn_open_matrix")
                        ) {
                            Icon(
                                imageVector = Icons.Default.GridView,
                                contentDescription = "Review Matrix",
                                modifier = Modifier.size(15.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Review Matrix ($answeredCount/$totalCount)",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Primary Action Row: Mark, Previous, Next, and Submit Exam
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Mark for Review Button
                        OutlinedButton(
                            onClick = { viewModel.toggleFlagQuestion(currentIndex) },
                            shape = RoundedCornerShape(12.dp),
                            colors = if (isFlagged) {
                                ButtonDefaults.outlinedButtonColors(
                                    containerColor = if (isCsc) CscWarningBg else WarningAmber.copy(alpha = 0.15f),
                                    contentColor = warningAccent
                                )
                            } else {
                                ButtonDefaults.outlinedButtonColors(
                                    containerColor = if (isCsc) CscCardSurface else Color.Transparent,
                                    contentColor = MaterialTheme.colorScheme.onSurface
                                )
                            },
                            border = if (isFlagged) {
                                BorderStroke(1.5.dp, warningAccent)
                            } else {
                                BorderStroke(1.dp, if (isCsc) CscBorder else MaterialTheme.colorScheme.outlineVariant)
                            },
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .heightIn(min = 48.dp)
                                .testTag("btn_mark_review")
                        ) {
                            Icon(
                                imageVector = if (isFlagged) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                contentDescription = if (isFlagged) "Marked" else "Mark for Review",
                                modifier = Modifier.size(16.dp),
                                tint = if (isFlagged) warningAccent else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (isFlagged) "Marked" else "Mark",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1
                            )
                        }

                        // Previous Question Button
                        OutlinedButton(
                            onClick = { viewModel.previousQuestion() },
                            enabled = currentIndex > 0,
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(
                                1.dp,
                                if (isCsc) CscBorder
                                else if (currentIndex > 0) MaterialTheme.colorScheme.outline
                                else MaterialTheme.colorScheme.outline.copy(alpha = 0.38f)
                            ),
                            colors = if (isCsc) {
                                ButtonDefaults.outlinedButtonColors(
                                    containerColor = CscCardSurface,
                                    contentColor = CscPrimaryBlue,
                                    disabledContainerColor = CscDisabledBg,
                                    disabledContentColor = CscTextSecondary
                                )
                            } else {
                                ButtonDefaults.outlinedButtonColors()
                            },
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .heightIn(min = 48.dp)
                                .testTag("btn_prev_question")
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Previous Question",
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Prev", fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                        }

                        // Next Question Button
                        Button(
                            onClick = {
                                if (currentIndex < totalCount - 1) {
                                    viewModel.nextQuestion()
                                } else {
                                    showConfirmFinishDialog = true
                                }
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = MaterialTheme.colorScheme.onPrimary
                            ),
                            shape = RoundedCornerShape(12.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .heightIn(min = 48.dp)
                                .testTag("btn_next_question")
                        ) {
                            Text("Next", fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = "Next Question",
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        // Always-Visible Submit Exam Button
                        Button(
                            onClick = { showConfirmFinishDialog = true },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = successAccent,
                                contentColor = Color.White
                            ),
                            shape = RoundedCornerShape(12.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp),
                            modifier = Modifier
                                .weight(1.15f)
                                .heightIn(min = 48.dp)
                                .testTag("btn_submit_exam")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Submit Examination",
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Submit", fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                        }
                    }
                }
            }
        }
    }

    // --- MODAL BOTTOM SHEET: QUESTION MATRIX & REVIEW DRAWER ---
    if (showQuestionGridSheet) {
        ModalBottomSheet(
            onDismissRequest = { showQuestionGridSheet = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = MaterialTheme.colorScheme.surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                // Sheet Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Question Matrix",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Jump directly to any question card",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(onClick = { showQuestionGridSheet = false }) {
                        Icon(Icons.Default.Close, contentDescription = "Close Matrix")
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Filter Category Chips
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val chipColors = if (isCsc) {
                        FilterChipDefaults.filterChipColors(
                            selectedContainerColor = CscSelectedBg,
                            selectedLabelColor = CscPrimaryBlue,
                            containerColor = CscCardSurface,
                            labelColor = CscTextSecondary
                        )
                    } else {
                        FilterChipDefaults.filterChipColors()
                    }
                    FilterChip(
                        selected = matrixFilter == MatrixFilter.ALL,
                        onClick = { matrixFilter = MatrixFilter.ALL },
                        label = { Text("All ($totalCount)", fontSize = 12.sp) },
                        colors = chipColors,
                        border = if (isCsc) FilterChipDefaults.filterChipBorder(enabled = true, selected = matrixFilter == MatrixFilter.ALL, borderColor = CscBorder, selectedBorderColor = CscPrimaryBlue) else FilterChipDefaults.filterChipBorder(enabled = true, selected = matrixFilter == MatrixFilter.ALL)
                    )
                    FilterChip(
                        selected = matrixFilter == MatrixFilter.ANSWERED,
                        onClick = { matrixFilter = MatrixFilter.ANSWERED },
                        label = { Text("Answered ($answeredCount)", fontSize = 12.sp) },
                        colors = chipColors,
                        border = if (isCsc) FilterChipDefaults.filterChipBorder(enabled = true, selected = matrixFilter == MatrixFilter.ANSWERED, borderColor = CscBorder, selectedBorderColor = CscPrimaryBlue) else FilterChipDefaults.filterChipBorder(enabled = true, selected = matrixFilter == MatrixFilter.ANSWERED)
                    )
                    FilterChip(
                        selected = matrixFilter == MatrixFilter.UNANSWERED,
                        onClick = { matrixFilter = MatrixFilter.UNANSWERED },
                        label = { Text("Remaining ($unansweredCount)", fontSize = 12.sp) },
                        colors = chipColors,
                        border = if (isCsc) FilterChipDefaults.filterChipBorder(enabled = true, selected = matrixFilter == MatrixFilter.UNANSWERED, borderColor = CscBorder, selectedBorderColor = CscPrimaryBlue) else FilterChipDefaults.filterChipBorder(enabled = true, selected = matrixFilter == MatrixFilter.UNANSWERED)
                    )
                    FilterChip(
                        selected = matrixFilter == MatrixFilter.FLAGGED,
                        onClick = { matrixFilter = MatrixFilter.FLAGGED },
                        label = { Text("Flagged (${flaggedIndices.size})", fontSize = 12.sp) },
                        colors = chipColors,
                        border = if (isCsc) FilterChipDefaults.filterChipBorder(enabled = true, selected = matrixFilter == MatrixFilter.FLAGGED, borderColor = CscBorder, selectedBorderColor = CscPrimaryBlue) else FilterChipDefaults.filterChipBorder(enabled = true, selected = matrixFilter == MatrixFilter.FLAGGED)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Filtered List of Indices
                val displayedIndices = questions.indices.filter { idx ->
                    when (matrixFilter) {
                        MatrixFilter.ALL -> true
                        MatrixFilter.ANSWERED -> userAnswers.containsKey(idx)
                        MatrixFilter.UNANSWERED -> !userAnswers.containsKey(idx)
                        MatrixFilter.FLAGGED -> flaggedIndices.contains(idx)
                    }
                }

                // Grid of Questions
                if (displayedIndices.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No questions match this filter.",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 14.sp
                        )
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(5),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(260.dp)
                    ) {
                        items(displayedIndices.size) { i ->
                            val qIdx = displayedIndices[i]
                            val isAns = userAnswers.containsKey(qIdx)
                            val isFlg = flaggedIndices.contains(qIdx)
                            val isCurr = qIdx == currentIndex

                            val cellBg = if (isCsc) {
                                when {
                                    isFlg -> CscWarningBg
                                    isAns -> CscSuccessBg
                                    else -> CscWarmBackground
                                }
                            } else {
                                when {
                                    isFlg -> WarningAmber.copy(alpha = 0.25f)
                                    isAns -> SuccessGreen.copy(alpha = 0.2f)
                                    else -> MaterialTheme.colorScheme.surfaceVariant
                                }
                            }

                            val cellBorder = if (isCsc) {
                                when {
                                    isCurr -> CscPrimaryBlue
                                    isFlg -> CscWarningBorder
                                    isAns -> CscSuccessBorder
                                    else -> CscBorder
                                }
                            } else {
                                when {
                                    isCurr -> MaterialTheme.colorScheme.primary
                                    isFlg -> WarningAmber
                                    isAns -> SuccessGreen
                                    else -> Color.Transparent
                                }
                            }

                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = cellBg,
                                border = BorderStroke(
                                    width = if (isCurr) 2.dp else 1.dp,
                                    color = cellBorder
                                ),
                                modifier = Modifier
                                    .size(52.dp)
                                    .clickable {
                                        viewModel.goToQuestion(qIdx)
                                        showQuestionGridSheet = false
                                    }
                                    .testTag("grid_question_$qIdx")
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Text(
                                            text = "${qIdx + 1}",
                                            fontWeight = if (isCurr) FontWeight.Bold else FontWeight.SemiBold,
                                            fontSize = 14.sp,
                                            color = when {
                                                isFlg -> warningAccent
                                                isAns -> successAccent
                                                else -> MaterialTheme.colorScheme.onSurface
                                            }
                                        )
                                        if (isFlg) {
                                            Icon(
                                                imageVector = Icons.Default.Bookmark,
                                                contentDescription = "Flagged",
                                                tint = warningAccent,
                                                modifier = Modifier.size(11.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Bottom Action: Finish Exam Early Button
                Button(
                    onClick = {
                        showQuestionGridSheet = false
                        showConfirmFinishDialog = true
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("btn_submit_from_matrix"),
                    colors = ButtonDefaults.buttonColors(containerColor = successAccent, contentColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Submit Examination for Scoring", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }

    // --- PAUSE SESSION DIALOG ---
    if (showPauseDialog) {
        AlertDialog(
            onDismissRequest = {
                showPauseDialog = false
                viewModel.resumeTimer()
            },
            containerColor = MaterialTheme.colorScheme.surface,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Pause,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Exam Paused")
                }
            },
            text = {
                Column {
                    Text(
                        text = "Your simulation timer has been paused. Take a quick breath and resume when ready.",
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = if (isCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant
                        ),
                        border = if (isCsc) BorderStroke(1.dp, CscBorder) else null,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Time Remaining: $timeFormatted", fontWeight = FontWeight.Bold, color = timerColor, fontSize = 14.sp)
                            Text("Answered: $answeredCount of $totalCount ($unansweredCount remaining)", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface)
                            Text("Flagged for Review: ${flaggedIndices.size}", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface)
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    OutlinedButton(
                        onClick = {
                            showPauseDialog = false
                            viewModel.pauseAndExitToDashboard()
                        },
                        border = BorderStroke(1.dp, if (isCsc) CscBorder else MaterialTheme.colorScheme.outline),
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 48.dp)
                            .testTag("btn_save_and_exit_exam")
                    ) {
                        Text("Save & Exit to Dashboard", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showPauseDialog = false
                        viewModel.resumeTimer()
                    },
                    modifier = Modifier.heightIn(min = 48.dp).testTag("btn_resume_exam")
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Resume Exam", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showPauseDialog = false
                        viewModel.resumeTimer()
                        showExitWarningDialog = true
                    },
                    modifier = Modifier.heightIn(min = 48.dp)
                ) {
                    Text("Abandon Exam", color = errorAccent, fontWeight = FontWeight.SemiBold)
                }
            }
        )
    }

    // --- CONFIRM FINISH & GRADE DIALOG ---
    if (showConfirmFinishDialog) {
        AlertDialog(
            onDismissRequest = { showConfirmFinishDialog = false },
            containerColor = MaterialTheme.colorScheme.surface,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (unansweredCount > 0) Icons.Default.Warning else Icons.Default.Check,
                        contentDescription = null,
                        tint = if (unansweredCount > 0) warningAccent else successAccent
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Submit Examination?")
                }
            },
            text = {
                Column {
                    if (unansweredCount > 0) {
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = if (isCsc) CscErrorBg else ErrorRed.copy(alpha = 0.1f)
                            ),
                            border = if (isCsc) BorderStroke(1.dp, CscErrorBorder) else null,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Notice: You have $unansweredCount unanswered question(s). Unanswered questions will be scored as zero.",
                                color = errorAccent,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp,
                                lineHeight = 20.sp,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    if (flaggedIndices.isNotEmpty()) {
                        Text(
                            text = "You still have ${flaggedIndices.size} flagged question(s) marked for review.",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = warningAccent
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                    }

                    Text(
                        text = "Once submitted, your attempt will be finalized and an in-depth domain competency scorecard will be generated.",
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showConfirmFinishDialog = false
                        viewModel.finishSimulation()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = successAccent, contentColor = Color.White),
                    modifier = Modifier.heightIn(min = 48.dp).testTag("btn_confirm_finish")
                ) {
                    Text("Yes, Finalize & Score", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showConfirmFinishDialog = false },
                    modifier = Modifier.heightIn(min = 48.dp)
                ) {
                    Text("Review Questions")
                }
            }
        )
    }

    // --- EXIT SESSION WARNING DIALOG ---
    if (showExitWarningDialog) {
        AlertDialog(
            onDismissRequest = { showExitWarningDialog = false },
            containerColor = MaterialTheme.colorScheme.surface,
            title = { Text("Leave Active Exam?") },
            text = {
                Text(
                    "Exiting now will abandon this active session and discard unsubmitted question responses. Do you wish to exit?",
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showExitWarningDialog = false
                        viewModel.abandonSimulation()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = errorAccent, contentColor = Color.White),
                    modifier = Modifier.heightIn(min = 48.dp)
                ) {
                    Text("Exit Session", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showExitWarningDialog = false },
                    modifier = Modifier.heightIn(min = 48.dp)
                ) {
                    Text("Stay in Exam")
                }
            }
        )
    }
}

/**
 * Question Card Content Composable rendering question text, eliminated distractors,
 * answer options, and authoritative source citation.
 */
@Composable
private fun QuestionCardContent(
    question: Question,
    questionIndex: Int,
    selectedOptionIndex: Int?,
    struckOptions: Set<Int>,
    isAdaptivePractice: Boolean,
    isChecked: Boolean,
    selectionReason: String?,
    exhaustionNotice: String?,
    practiceFeedback: PracticeAnswerFeedback?,
    onSelectOption: (Int) -> Unit,
    onToggleStrike: (Int) -> Unit,
    onCheckAnswer: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isCsc = com.example.BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-")
    val successAccent = if (isCsc) CscSuccessDark else SuccessGreen
    val warningAccent = if (isCsc) CscWarningDark else WarningAmber
    val errorAccent = if (isCsc) CscErrorDark else ErrorRed
    val resolvedTopic = AdaptivePracticeEngine.resolveTopic(question)
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        if (!exhaustionNotice.isNullOrBlank()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth().testTag("practice_exhaustion_notice"),
                    shape = RoundedCornerShape(10.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isCsc) CscWarningBg else WarningAmber.copy(alpha = 0.12f)
                    ),
                    border = if (isCsc) BorderStroke(1.dp, CscWarningBorder) else null
                ) {
                    Text(
                        text = exhaustionNotice,
                        fontSize = 13.sp,
                        lineHeight = 19.sp,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            }
        }

        if (isAdaptivePractice && !selectionReason.isNullOrBlank()) {
            item {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isCsc) CscSelectedBg else AccentBlue.copy(alpha = 0.12f),
                    border = if (isCsc) BorderStroke(1.dp, CscBorder) else null,
                    modifier = Modifier.testTag("selection_reason_chip")
                ) {
                    Text(
                        text = selectionReason,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isCsc) CscPrimaryBlue else AccentBlue,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }

        // Domain & Difficulty Header Tag
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isCsc) CscCreamSecondary else MaterialTheme.colorScheme.primaryContainer,
                    border = if (isCsc) BorderStroke(1.dp, CscBorder) else null,
                    modifier = Modifier.weight(1f, fill = false)
                ) {
                    Column(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = question.domainName,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (isCsc) CscTextPrimary else MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        if (resolvedTopic.hasExplicitMapping) {
                            Text(
                                text = resolvedTopic.topicName,
                                fontSize = 12.sp,
                                color = if (isCsc) CscTextSecondary else MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f)
                            )
                        }
                    }
                }

                if (question.difficultyExplicit) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (isCsc) CscCardSurface else MaterialTheme.colorScheme.surfaceVariant,
                        border = if (isCsc) BorderStroke(1.dp, CscBorder) else null
                    ) {
                        Text(
                            text = question.difficulty.name,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp)
                        )
                    }
                }
            }
        }

        // Main Question Statement Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("question_card_${question.id}"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = if (isCsc) BorderStroke(1.dp, CscBorder) else null,
                elevation = CardDefaults.cardElevation(defaultElevation = if (isCsc) 0.dp else 2.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = question.questionText,
                        fontSize = if (isCsc) 19.sp else 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface,
                        lineHeight = if (isCsc) 27.sp else 23.sp
                    )
                }
            }
        }

        // Distractor Elimination Subtitle
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Select the best answer:",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Tap ̶S̶ to strike out",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Selectable Option Cards (A, B, C, D)
        items(question.options.size) { optIndex ->
            val optionText = question.options[optIndex]
            val isSelected = selectedOptionIndex == optIndex
            val isStruck = struckOptions.contains(optIndex)
            val isCorrectOpt = optIndex == question.correctIndex
            val optionLetter = ('A'.code + optIndex).toChar().toString()

            val optionBorderColor = when {
                isChecked && isCorrectOpt -> successAccent
                isChecked && isSelected && !isCorrectOpt -> errorAccent
                isSelected -> MaterialTheme.colorScheme.primary
                isStruck -> if (isCsc) CscBorder else MaterialTheme.colorScheme.surfaceVariant
                else -> if (isCsc) CscBorder else MaterialTheme.colorScheme.outlineVariant
            }

            val optionBgColor = if (isCsc) {
                when {
                    isChecked && isCorrectOpt -> CscSuccessBg
                    isChecked && isSelected && !isCorrectOpt -> CscErrorBg
                    isSelected -> CscSelectedBg
                    isStruck -> CscCreamSecondary
                    else -> CscCardSurface
                }
            } else {
                when {
                    isChecked && isCorrectOpt -> SuccessGreen.copy(alpha = 0.14f)
                    isChecked && isSelected && !isCorrectOpt -> ErrorRed.copy(alpha = 0.12f)
                    isSelected -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                    isStruck -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.25f)
                    else -> MaterialTheme.colorScheme.surface
                }
            }

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 52.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .border(
                        width = if (isSelected || (isChecked && isCorrectOpt)) 2.dp else 1.dp,
                        color = optionBorderColor,
                        shape = RoundedCornerShape(14.dp)
                    )
                    .clickable(enabled = !isChecked) {
                        if (!isStruck) {
                            onSelectOption(optIndex)
                        }
                    }
                    .testTag("option_$optIndex"),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = optionBgColor),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Option Letter Badge (A, B, C, D)
                    Surface(
                        shape = CircleShape,
                        color = when {
                            isChecked && isCorrectOpt -> successAccent
                            isChecked && isSelected && !isCorrectOpt -> errorAccent
                            isSelected -> MaterialTheme.colorScheme.primary
                            else -> if (isCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant
                        },
                        border = if (isCsc && !isSelected && !(isChecked && isCorrectOpt)) BorderStroke(1.dp, CscBorder) else null,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = optionLetter,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected || (isChecked && isCorrectOpt) || (isChecked && isSelected && !isCorrectOpt)) {
                                    Color.White
                                } else {
                                    MaterialTheme.colorScheme.onSurface
                                }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    // Radio indicator
                    RadioButton(
                        selected = isSelected,
                        onClick = {
                            if (!isChecked && !isStruck) onSelectOption(optIndex)
                        },
                        colors = RadioButtonDefaults.colors(
                            selectedColor = when {
                                isChecked && isCorrectOpt -> successAccent
                                isChecked && !isCorrectOpt -> errorAccent
                                else -> MaterialTheme.colorScheme.primary
                            }
                        ),
                        enabled = !isChecked && !isStruck
                    )

                    Spacer(modifier = Modifier.width(4.dp))

                    // Option Text + Explicit Check State Text Label (never rely on color alone)
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = optionText,
                            fontSize = if (isCsc) 16.sp else 14.sp,
                            color = if (isStruck) (if (isCsc) CscTextSecondary else Slate400) else MaterialTheme.colorScheme.onSurface,
                            textDecoration = if (isStruck) TextDecoration.LineThrough else TextDecoration.None,
                            lineHeight = if (isCsc) 23.sp else 20.sp
                        )
                        if (isChecked && (isCorrectOpt || (isSelected && !isCorrectOpt))) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isCorrectOpt) CscCardSurface else CscCardSurface)
                                    .border(
                                        1.dp,
                                        if (isCorrectOpt) CscSuccessBorder else CscErrorBorder,
                                        RoundedCornerShape(6.dp)
                                    )
                                    .padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Icon(
                                    imageVector = if (isCorrectOpt) Icons.Default.Check else Icons.Default.Close,
                                    contentDescription = if (isCorrectOpt) "Correct" else "Incorrect",
                                    tint = if (isCorrectOpt) successAccent else errorAccent,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (isCorrectOpt) "Correct" else "Incorrect",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isCorrectOpt) successAccent else errorAccent
                                )
                            }
                        }
                    }

                    // Distractor Elimination Button (Strike-through) — minimum 48dp touch target
                    IconButton(
                        onClick = { if (!isChecked) onToggleStrike(optIndex) },
                        modifier = Modifier
                            .size(48.dp)
                            .testTag("strike_option_$optIndex")
                    ) {
                        Icon(
                            imageVector = Icons.Default.FormatStrikethrough,
                            contentDescription = if (isStruck) "Restore choice" else "Eliminate choice",
                            tint = if (isStruck) errorAccent else (if (isCsc) CscTextSecondary else Slate400),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }

        // Immediate Practice Check Button (only in adaptive practice modes, hidden in strict exams)
        if (isAdaptivePractice && selectedOptionIndex != null && !isChecked) {
            item {
                Button(
                    onClick = onCheckAnswer,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                        .testTag("btn_check_answer"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Check Answer", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
        }

        // Immediate Feedback & Distractor Analysis Card (only after Check Answer in adaptive practice)
        if (isAdaptivePractice && isChecked && practiceFeedback != null) {
            item {
                val feedbackColor = if (practiceFeedback.isCorrect) successAccent else errorAccent
                val feedbackBg = if (isCsc) {
                    if (practiceFeedback.isCorrect) CscSuccessBg else CscErrorBg
                } else {
                    feedbackColor.copy(alpha = 0.08f)
                }
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("practice_feedback_card"),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = feedbackBg),
                    border = BorderStroke(1.5.dp, feedbackColor)
                ) {
                    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = if (practiceFeedback.isCorrect) Icons.Default.Check else Icons.Default.Close,
                                contentDescription = null,
                                tint = feedbackColor,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (practiceFeedback.isCorrect) "Correct Answer" else "Incorrect — Review Rationale",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = feedbackColor
                            )
                        }

                        if (!practiceFeedback.isCorrect && !practiceFeedback.selectedOptionAnalysis.isNullOrBlank()) {
                            Text(
                                text = "Why your choice was incorrect: ${practiceFeedback.selectedOptionAnalysis}",
                                fontSize = 14.sp,
                                lineHeight = 20.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        Text(
                            text = practiceFeedback.explanation,
                            fontSize = 15.sp,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = 22.sp
                        )

                        if (practiceFeedback.learningObjective.isNotBlank()) {
                            Text(
                                text = "Learning Objective: ${practiceFeedback.learningObjective}",
                                fontSize = 13.sp,
                                lineHeight = 18.sp,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        if (!practiceFeedback.remediationNotice.isNullOrBlank()) {
                            Text(
                                text = practiceFeedback.remediationNotice,
                                fontSize = 13.sp,
                                lineHeight = 19.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (isCsc) CscPrimaryBlue else AccentBlue
                            )
                        }

                        practiceFeedback.updatedTopicMastery?.let { tState ->
                            Text(
                                text = "Updated Topic Mastery (${tState.topicName}): ${tState.masteryPercent}% • ${tState.confidence.displayLabel()}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }

        // Authoritative Source Citation Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("source_citation_card"),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                ),
                border = if (isCsc) BorderStroke(1.dp, CscBorder) else null
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = CircleShape,
                        color = if (isCsc) CscCardSurface else MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                        border = if (isCsc) BorderStroke(1.dp, CscBorder) else null,
                        modifier = Modifier.size(34.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(17.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Authoritative Exam Reference",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "${question.citation.title} • ${question.citation.sectionOrPage}",
                            fontSize = 13.sp,
                            lineHeight = 18.sp,
                            color = if (isCsc) CscTextPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

