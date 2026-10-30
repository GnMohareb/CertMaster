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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.ExamMode
import com.example.model.Question
import com.example.ui.ExamViewModel
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
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

    val timerColor = when {
        remainingSeconds < 300 -> ErrorRed
        remainingSeconds < 600 -> WarningAmber
        else -> MaterialTheme.colorScheme.primary
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
                        text = currentQ.domainName,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.primary,
                        maxLines = 1
                    )
                }
            },
            actions = {
                // Interactive Countdown Timer Pill
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = timerColor.copy(alpha = 0.12f),
                    modifier = Modifier
                        .clickable {
                            viewModel.pauseTimer()
                            showPauseDialog = true
                        }
                        .testTag("timer_chip")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
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
                        tint = if (isFlagged) WarningAmber else MaterialTheme.colorScheme.onSurfaceVariant
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
                                    .background(WarningAmber)
                            )
                        }
                    }
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        )

        // --- PROGRESS TRACKING SECTION ---
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 16.dp, vertical = 6.dp)
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
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Progress status pills
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    // Answered Count Pill
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(SuccessGreen)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "$answeredCount Answered",
                            fontSize = 11.sp,
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
                                    .background(WarningAmber)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${flaggedIndices.size} Flagged",
                                fontSize = 11.sp,
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
                                .background(Slate400)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "$unansweredCount Remaining",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Completion percentage
                Text(
                    text = "${(completionFraction * 100).toInt()}% Done",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }

        // --- HORIZONTAL QUICK-JUMP NAVIGATION RIBBON ---
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
            tonalElevation = 1.dp
        ) {
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

                    val pillBg = when {
                        isCurrent -> MaterialTheme.colorScheme.primary
                        isFlaggedItem -> WarningAmber.copy(alpha = 0.2f)
                        isAnswered -> SuccessGreen.copy(alpha = 0.15f)
                        else -> MaterialTheme.colorScheme.surface
                    }

                    val pillBorderColor = when {
                        isCurrent -> MaterialTheme.colorScheme.primary
                        isFlaggedItem -> WarningAmber
                        isAnswered -> SuccessGreen
                        else -> MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f)
                    }

                    val textColor = when {
                        isCurrent -> MaterialTheme.colorScheme.onPrimary
                        isFlaggedItem -> WarningAmber
                        isAnswered -> SuccessGreen
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    }

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = pillBg,
                        border = androidx.compose.foundation.BorderStroke(1.dp, pillBorderColor),
                        modifier = Modifier
                            .size(width = 46.dp, height = 36.dp)
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
                                    Spacer(modifier = Modifier.width(2.dp))
                                    Box(
                                        modifier = Modifier
                                            .size(5.dp)
                                            .clip(CircleShape)
                                            .background(WarningAmber)
                                    )
                                }
                            }
                        }
                    }
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

            QuestionCardContent(
                question = activeQuestion,
                questionIndex = targetIndex,
                selectedOptionIndex = activeSelectedOption,
                struckOptions = activeStruck,
                onSelectOption = { optIdx -> viewModel.selectOption(targetIndex, optIdx) },
                onToggleStrike = { optIdx -> viewModel.toggleStrikeOption(targetIndex, optIdx) }
            )
        }

        // --- BOTTOM NAVIGATION BAR ---
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 8.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                // Secondary Control Row: Review Matrix trigger & question index
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Question ${currentIndex + 1} of $totalCount",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    OutlinedButton(
                        onClick = { showQuestionGridSheet = true },
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                        modifier = Modifier.height(28.dp).testTag("btn_open_matrix")
                    ) {
                        Icon(
                            imageVector = Icons.Default.GridView,
                            contentDescription = "Review Matrix",
                            modifier = Modifier.size(13.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Review Matrix ($answeredCount/$totalCount)",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // Primary Action Row: Mark, Previous, Next, and Submit Exam
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Mark for Review Button
                    OutlinedButton(
                        onClick = { viewModel.toggleFlagQuestion(currentIndex) },
                        shape = RoundedCornerShape(12.dp),
                        colors = if (isFlagged) {
                            ButtonDefaults.outlinedButtonColors(
                                containerColor = WarningAmber.copy(alpha = 0.15f),
                                contentColor = WarningAmber
                            )
                        } else {
                            ButtonDefaults.outlinedButtonColors()
                        },
                        border = if (isFlagged) {
                            BorderStroke(1.5.dp, WarningAmber)
                        } else {
                            BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
                        },
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("btn_mark_review")
                    ) {
                        Icon(
                            imageVector = if (isFlagged) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                            contentDescription = if (isFlagged) "Marked" else "Mark for Review",
                            modifier = Modifier.size(16.dp),
                            tint = if (isFlagged) WarningAmber else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = if (isFlagged) "Marked" else "Mark",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1
                        )
                    }

                    // Previous Question Button
                    OutlinedButton(
                        onClick = { viewModel.previousQuestion() },
                        enabled = currentIndex > 0,
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("btn_prev_question")
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Previous Question",
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text("Prev", fontSize = 11.sp, maxLines = 1)
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
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("btn_next_question")
                    ) {
                        Text("Next", fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                        Spacer(modifier = Modifier.width(3.dp))
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = "Next Question",
                            modifier = Modifier.size(15.dp)
                        )
                    }

                    // Always-Visible Submit Exam Button
                    Button(
                        onClick = { showConfirmFinishDialog = true },
                        colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                        shape = RoundedCornerShape(12.dp),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp),
                        modifier = Modifier
                            .weight(1.2f)
                            .testTag("btn_submit_exam")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Submit Examination",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text("Submit", fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, maxLines = 1)
                    }
                }
            }
        }
    }

    // --- MODAL BOTTOM SHEET: QUESTION MATRIX & REVIEW DRAWER ---
    if (showQuestionGridSheet) {
        ModalBottomSheet(
            onDismissRequest = { showQuestionGridSheet = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
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
                            fontSize = 12.sp,
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
                    FilterChip(
                        selected = matrixFilter == MatrixFilter.ALL,
                        onClick = { matrixFilter = MatrixFilter.ALL },
                        label = { Text("All ($totalCount)", fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors()
                    )
                    FilterChip(
                        selected = matrixFilter == MatrixFilter.ANSWERED,
                        onClick = { matrixFilter = MatrixFilter.ANSWERED },
                        label = { Text("Answered ($answeredCount)", fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors()
                    )
                    FilterChip(
                        selected = matrixFilter == MatrixFilter.UNANSWERED,
                        onClick = { matrixFilter = MatrixFilter.UNANSWERED },
                        label = { Text("Remaining ($unansweredCount)", fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors()
                    )
                    FilterChip(
                        selected = matrixFilter == MatrixFilter.FLAGGED,
                        onClick = { matrixFilter = MatrixFilter.FLAGGED },
                        label = { Text("Flagged (${flaggedIndices.size})", fontSize = 12.sp) },
                        colors = FilterChipDefaults.filterChipColors()
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
                            fontSize = 13.sp
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

                            val cellBg = when {
                                isFlg -> WarningAmber.copy(alpha = 0.25f)
                                isAns -> SuccessGreen.copy(alpha = 0.2f)
                                else -> MaterialTheme.colorScheme.surfaceVariant
                            }

                            val cellBorder = when {
                                isCurr -> MaterialTheme.colorScheme.primary
                                isFlg -> WarningAmber
                                isAns -> SuccessGreen
                                else -> Color.Transparent
                            }

                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = cellBg,
                                border = androidx.compose.foundation.BorderStroke(
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
                                                isFlg -> WarningAmber
                                                isAns -> SuccessGreen
                                                else -> MaterialTheme.colorScheme.onSurface
                                            }
                                        )
                                        if (isFlg) {
                                            Icon(
                                                imageVector = Icons.Default.Bookmark,
                                                contentDescription = "Flagged",
                                                tint = WarningAmber,
                                                modifier = Modifier.size(10.dp)
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
                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Check, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Submit Examination for Scoring", fontWeight = FontWeight.Bold)
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
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("Time Remaining: $timeFormatted", fontWeight = FontWeight.Bold, color = timerColor)
                            Text("Answered: $answeredCount of $totalCount ($unansweredCount remaining)")
                            Text("Flagged for Review: ${flaggedIndices.size}")
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showPauseDialog = false
                        viewModel.resumeTimer()
                    },
                    modifier = Modifier.testTag("btn_resume_exam")
                ) {
                    Icon(Icons.Default.PlayArrow, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Resume Exam")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showPauseDialog = false
                        viewModel.resumeTimer()
                        showExitWarningDialog = true
                    }
                ) {
                    Text("Exit Simulation", color = ErrorRed)
                }
            }
        )
    }

    // --- CONFIRM FINISH & GRADE DIALOG ---
    if (showConfirmFinishDialog) {
        AlertDialog(
            onDismissRequest = { showConfirmFinishDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (unansweredCount > 0) Icons.Default.Warning else Icons.Default.Check,
                        contentDescription = null,
                        tint = if (unansweredCount > 0) WarningAmber else SuccessGreen
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Submit Examination?")
                }
            },
            text = {
                Column {
                    if (unansweredCount > 0) {
                        Card(
                            colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.1f)),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Notice: You have $unansweredCount unanswered question(s). Unanswered questions will be scored as zero.",
                                color = ErrorRed,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(10.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    if (flaggedIndices.isNotEmpty()) {
                        Text(
                            text = "You still have ${flaggedIndices.size} flagged question(s) marked for review.",
                            fontSize = 12.sp,
                            color = WarningAmber
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                    }

                    Text(
                        text = "Once submitted, your attempt will be finalized and an in-depth domain competency scorecard will be generated.",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showConfirmFinishDialog = false
                        viewModel.finishSimulation()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                    modifier = Modifier.testTag("btn_confirm_finish")
                ) {
                    Text("Yes, Finalize & Score")
                }
            },
            dismissButton = {
                TextButton(onClick = { showConfirmFinishDialog = false }) {
                    Text("Review Questions")
                }
            }
        )
    }

    // --- EXIT SESSION WARNING DIALOG ---
    if (showExitWarningDialog) {
        AlertDialog(
            onDismissRequest = { showExitWarningDialog = false },
            title = { Text("Leave Active Exam?") },
            text = {
                Text("Exiting now will abandon this active session and discard unsubmitted question responses. Do you wish to exit?")
            },
            confirmButton = {
                Button(
                    onClick = {
                        showExitWarningDialog = false
                        viewModel.handleBackPress()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = ErrorRed)
                ) {
                    Text("Exit Session")
                }
            },
            dismissButton = {
                TextButton(onClick = { showExitWarningDialog = false }) {
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
    onSelectOption: (Int) -> Unit,
    onToggleStrike: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Domain & Difficulty Header Tag
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.primaryContainer
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = question.domainName,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Text(
                        text = question.difficulty.name,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
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
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = question.questionText,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface,
                        lineHeight = 23.sp
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
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Tap ̶S̶ to eliminate distractors",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
                )
            }
        }

        // Selectable Option Cards (A, B, C, D)
        items(question.options.size) { optIndex ->
            val optionText = question.options[optIndex]
            val isSelected = selectedOptionIndex == optIndex
            val isStruck = struckOptions.contains(optIndex)
            val optionLetter = ('A'.code + optIndex).toChar().toString()

            val optionBorderColor = when {
                isSelected -> MaterialTheme.colorScheme.primary
                isStruck -> MaterialTheme.colorScheme.surfaceVariant
                else -> MaterialTheme.colorScheme.outlineVariant
            }

            val optionBgColor = when {
                isSelected -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                isStruck -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.25f)
                else -> MaterialTheme.colorScheme.surface
            }

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .border(
                        width = if (isSelected) 2.dp else 1.dp,
                        color = optionBorderColor,
                        shape = RoundedCornerShape(14.dp)
                    )
                    .clickable {
                        if (!isStruck) {
                            onSelectOption(optIndex)
                        }
                    }
                    .testTag("option_$optIndex"),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = optionBgColor)
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
                        color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = optionLetter,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    // Radio indicator
                    RadioButton(
                        selected = isSelected,
                        onClick = {
                            if (!isStruck) onSelectOption(optIndex)
                        },
                        colors = RadioButtonDefaults.colors(
                            selectedColor = MaterialTheme.colorScheme.primary
                        ),
                        enabled = !isStruck
                    )

                    Spacer(modifier = Modifier.width(6.dp))

                    // Option Text
                    Text(
                        text = optionText,
                        fontSize = 14.sp,
                        color = if (isStruck) Slate400 else MaterialTheme.colorScheme.onSurface,
                        textDecoration = if (isStruck) TextDecoration.LineThrough else TextDecoration.None,
                        lineHeight = 20.sp,
                        modifier = Modifier.weight(1f)
                    )

                    // Distractor Elimination Button (Strike-through)
                    IconButton(
                        onClick = { onToggleStrike(optIndex) },
                        modifier = Modifier
                            .size(40.dp)
                            .testTag("strike_option_$optIndex")
                    ) {
                        Icon(
                            imageVector = Icons.Default.FormatStrikethrough,
                            contentDescription = if (isStruck) "Restore choice" else "Eliminate choice",
                            tint = if (isStruck) ErrorRed else Slate400,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }

        // NotebookLM Source Citation Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("source_citation_card"),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = CircleShape,
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.15f),
                        modifier = Modifier.size(32.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Authoritative Exam Reference",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "${question.citation.title} • ${question.citation.sectionOrPage}",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}
