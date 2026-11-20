package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Headphones
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Style
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.SourceDoc
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.AccentCyan
import com.example.ui.theme.CscBorder
import com.example.ui.theme.CscCardSurface
import com.example.ui.theme.CscCreamSecondary
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
import com.example.ui.theme.GoldMastery
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WarningAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotebookSourcesScreen(
    viewModel: ExamViewModel,
    modifier: Modifier = Modifier
) {
    val sources by viewModel.sources.collectAsState()
    val audioOverviews by viewModel.audioOverviews.collectAsState()
    val flashcards by viewModel.flashcards.collectAsState()
    val selectedSource by viewModel.selectedSource.collectAsState()

    val isOfflineCsc = com.example.BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-")

    // 0: Study Notes, 1: Flashcards, 2: Audio Briefings
    var selectedTab by remember { mutableIntStateOf(0) }
    var showAddSourceDialog by remember { mutableStateOf(false) }
    var showAddFlashcardDialog by remember { mutableStateOf(false) }

    // Flashcards state
    val cardIndex by viewModel.currentCardIndex.collectAsState()
    val isFlipped by viewModel.isCardFlipped.collectAsState()

    BackHandler {
        viewModel.navigateTo(AppScreen.DASHBOARD)
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        floatingActionButton = {
            if (selectedTab == 0 || (selectedTab == 1 && !isOfflineCsc)) {
                FloatingActionButton(
                    onClick = {
                        if (selectedTab == 0) {
                            showAddSourceDialog = true
                        } else {
                            showAddFlashcardDialog = true
                        }
                    },
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = Color.White,
                    modifier = Modifier.testTag(if (selectedTab == 0) "fab_add_source" else "fab_add_flashcard")
                ) {
                    Icon(
                        Icons.Default.Add,
                        contentDescription = if (selectedTab == 0) "Add Notes" else "Add Flashcard"
                    )
                }
            }
        }
    ) { paddingVals ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingVals)
        ) {
            // Study Hub Navigation Tabs (Study Notes, Flashcards, Audio Overviews)
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.primary,
                divider = {
                    HorizontalDivider(
                        thickness = 1.dp,
                        color = if (isOfflineCsc) CscBorder else MaterialTheme.colorScheme.outlineVariant
                    )
                }
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.MenuBook, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Study Notes", fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1)
                        }
                    },
                    modifier = Modifier.testTag("tab_study_notes")
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Style, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Flashcards (${flashcards.size})", fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1)
                        }
                    },
                    modifier = Modifier.testTag("tab_flashcards")
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Headphones, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Audio", fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1)
                        }
                    },
                    modifier = Modifier.testTag("tab_audio_briefings")
                )
            }

            // Tab Content
            when (selectedTab) {
                // TAB 0: STUDY NOTES & SYLLABUS GUIDES
                0 -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        item {
                            Text(
                                text = "Grounded Study Notes & Frameworks (${sources.size})",
                                fontSize = if (isOfflineCsc) 18.sp else 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                            Text(
                                text = "Official standards, cheat sheets, and domain notes",
                                fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isOfflineCsc) CscSuccessBg else SuccessGreen.copy(alpha = 0.12f))
                                    .then(
                                        if (isOfflineCsc) Modifier.border(1.dp, CscSuccessBorder, RoundedCornerShape(8.dp)) else Modifier
                                    )
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                                    .testTag("notes_offline_cached_badge")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = "Room Local Cache Active",
                                    tint = if (isOfflineCsc) CscSuccessDark else SuccessGreen,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Room SQLite Cache Active • Available 100% Offline",
                                    fontSize = if (isOfflineCsc) 12.sp else 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (isOfflineCsc) CscSuccessDark else SuccessGreen
                                )
                            }
                        }

                        if (sources.isEmpty()) {
                            item {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(14.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                                    elevation = CardDefaults.cardElevation(0.dp)
                                ) {
                                    Column(
                                        modifier = Modifier.padding(20.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Text(
                                            text = "No Study Guides Installed Yet",
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Text(
                                            text = "Add your own chapter notes and key takeaways to store them locally for offline study.",
                                            fontSize = 13.sp,
                                            lineHeight = 19.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            textAlign = TextAlign.Center
                                        )
                                        Spacer(modifier = Modifier.height(12.dp))
                                        Button(
                                            onClick = { showAddSourceDialog = true },
                                            shape = RoundedCornerShape(12.dp),
                                            modifier = Modifier.heightIn(min = 48.dp)
                                        ) {
                                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Add Study Notes", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                                        }
                                    }
                                }
                            }
                        }

                        items(sources) { doc ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(14.dp))
                                    .clickable { viewModel.openSource(doc) }
                                    .testTag("source_card_${doc.id}"),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                                elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 2.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(if (isOfflineCsc) CscSelectedBg else AccentBlue.copy(alpha = 0.12f))
                                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                text = doc.domainName,
                                                fontSize = if (isOfflineCsc) 12.sp else 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (isOfflineCsc) CscPrimaryBlue else AccentBlue
                                            )
                                        }

                                        Text(
                                            text = doc.type.name.replace("_", " "),
                                            fontSize = if (isOfflineCsc) 12.sp else 10.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))

                                    Text(
                                        text = doc.title,
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )

                                    Text(
                                        text = "Author / Issuer: ${doc.authorOrStandard}",
                                        fontSize = if (isOfflineCsc) 12.sp else 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )

                                    Spacer(modifier = Modifier.height(6.dp))

                                    Text(
                                        text = doc.summary,
                                        fontSize = if (isOfflineCsc) 14.sp else 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        lineHeight = if (isOfflineCsc) 20.sp else 17.sp
                                    )

                                    Spacer(modifier = Modifier.height(10.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        OutlinedButton(
                                            onClick = { selectedTab = 1 },
                                            shape = RoundedCornerShape(10.dp),
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
                                            Icon(Icons.Default.Style, contentDescription = null, modifier = Modifier.size(14.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Recall Flashcards", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                        }

                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            modifier = Modifier
                                                .heightIn(min = 48.dp)
                                                .clip(RoundedCornerShape(10.dp))
                                                .clickable { viewModel.openSource(doc) }
                                                .padding(horizontal = 10.dp, vertical = 8.dp)
                                        ) {
                                            Text(
                                                text = "Read Full Notes",
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = MaterialTheme.colorScheme.primary
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Icon(
                                                Icons.Default.ArrowForward,
                                                contentDescription = null,
                                                tint = MaterialTheme.colorScheme.primary,
                                                modifier = Modifier.size(15.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // TAB 1: FLASHCARDS DECK (Active Recall & Leitner Spaced Repetition)
                1 -> {
                    if (flashcards.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                                elevation = CardDefaults.cardElevation(0.dp)
                            ) {
                                Column(
                                    modifier = Modifier.padding(20.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = "No Flashcards Installed Yet",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = if (isOfflineCsc) "Study flashcards are unavailable." else "Create custom flashcards to practice with offline Leitner spaced repetition.",
                                        fontSize = 13.sp,
                                        lineHeight = 19.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        textAlign = TextAlign.Center
                                    )
                                    if (!isOfflineCsc) {
                                        Spacer(modifier = Modifier.height(12.dp))
                                        Button(
                                            onClick = { showAddFlashcardDialog = true },
                                            shape = RoundedCornerShape(12.dp),
                                            modifier = Modifier.heightIn(min = 48.dp)
                                        ) {
                                            Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("Add Flashcard", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        val safeCardIndex = cardIndex.coerceIn(0, flashcards.lastIndex)
                        val currentCard = flashcards[safeCardIndex]
                        val rotation by animateFloatAsState(
                            targetValue = if (isFlipped) 180f else 0f,
                            animationSpec = tween(400),
                            label = "card_flip"
                        )

                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            // Progress & Leitner info
                            Column(modifier = Modifier.fillMaxWidth()) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Card ${safeCardIndex + 1} of ${flashcards.size}",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onBackground
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(if (isOfflineCsc) CscWarningBg else GoldMastery.copy(alpha = 0.15f))
                                            .then(
                                                if (isOfflineCsc) Modifier.border(1.dp, CscWarningBorder, RoundedCornerShape(6.dp)) else Modifier
                                            )
                                            .padding(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                        Text(
                                            text = "Leitner Box ${currentCard.boxLevel} / 5",
                                            fontSize = if (isOfflineCsc) 12.sp else 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isOfflineCsc) CscWarningDark else GoldMastery
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                LinearProgressIndicator(
                                    progress = { ((safeCardIndex + 1).toFloat() / flashcards.size).coerceIn(0f, 1f) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(5.dp)
                                        .clip(RoundedCornerShape(3.dp)),
                                    color = MaterialTheme.colorScheme.primary,
                                    trackColor = if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant
                                )

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isOfflineCsc) CscSuccessBg else SuccessGreen.copy(alpha = 0.12f))
                                        .then(
                                            if (isOfflineCsc) Modifier.border(1.dp, CscSuccessBorder, RoundedCornerShape(6.dp)) else Modifier
                                        )
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                        .testTag("flashcards_offline_cached_badge")
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Room Local Cache",
                                        tint = if (isOfflineCsc) CscSuccessDark else SuccessGreen,
                                        modifier = Modifier.size(13.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = if (isOfflineCsc) "Spaced repetition" else "Room SQLite Spaced Repetition • Offline Ready",
                                        fontSize = if (isOfflineCsc) 12.sp else 10.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = if (isOfflineCsc) CscSuccessDark else SuccessGreen
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Interactive 3D Flipping Flashcard
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(300.dp)
                                    .graphicsLayer {
                                        rotationY = rotation
                                        cameraDistance = 12f * density
                                    }
                                    .clickable { viewModel.flipFlashcard() }
                                    .testTag("flashcard_flip_card"),
                                shape = RoundedCornerShape(if (isOfflineCsc) 16.dp else 20.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (rotation > 90f) {
                                        if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.surfaceVariant
                                    } else {
                                        if (isOfflineCsc) CscCardSurface else MaterialTheme.colorScheme.surface
                                    }
                                ),
                                border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                                elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(20.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (rotation <= 90f) {
                                        // FRONT: Prompt
                                        Column(
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalArrangement = Arrangement.SpaceBetween,
                                            modifier = Modifier.fillMaxSize()
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(if (isOfflineCsc) CscSelectedBg else AccentBlue.copy(alpha = 0.12f))
                                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                                            ) {
                                                Text(
                                                    text = currentCard.domainName,
                                                    fontSize = if (isOfflineCsc) 12.sp else 10.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = if (isOfflineCsc) CscPrimaryBlue else AccentBlue
                                                )
                                            }

                                            Text(
                                                text = currentCard.frontPrompt,
                                                fontSize = if (isOfflineCsc) 18.sp else 16.sp,
                                                fontWeight = FontWeight.Bold,
                                                textAlign = TextAlign.Center,
                                                lineHeight = if (isOfflineCsc) 26.sp else 22.sp,
                                                color = MaterialTheme.colorScheme.onSurface
                                            )

                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Icon(
                                                    Icons.Default.TouchApp,
                                                    contentDescription = null,
                                                    tint = if (isOfflineCsc) CscTextSecondary else Slate400,
                                                    modifier = Modifier.size(16.dp)
                                                )
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text(
                                                    text = "Tap card to reveal answer",
                                                    fontSize = 12.sp,
                                                    color = if (isOfflineCsc) CscTextSecondary else Slate400
                                                )
                                            }
                                        }
                                    } else {
                                        // BACK: Answer & Rule
                                        Column(
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalArrangement = Arrangement.SpaceBetween,
                                            modifier = Modifier
                                                .fillMaxSize()
                                                .graphicsLayer { rotationY = 180f }
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(6.dp))
                                                    .background(if (isOfflineCsc) CscSuccessBg else SuccessGreen.copy(alpha = 0.15f))
                                                    .then(
                                                        if (isOfflineCsc) Modifier.border(1.dp, CscSuccessBorder, RoundedCornerShape(6.dp)) else Modifier
                                                    )
                                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                                            ) {
                                                Text(
                                                    text = "EXAM ANSWER",
                                                    fontSize = if (isOfflineCsc) 11.sp else 10.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = if (isOfflineCsc) CscSuccessDark else SuccessGreen
                                                )
                                            }

                                            Text(
                                                text = currentCard.backAnswer,
                                                fontSize = if (isOfflineCsc) 15.sp else 13.sp,
                                                fontWeight = FontWeight.Medium,
                                                textAlign = TextAlign.Center,
                                                lineHeight = if (isOfflineCsc) 22.sp else 18.sp,
                                                color = MaterialTheme.colorScheme.onSurface
                                            )

                                            val linkedDoc = sources.firstOrNull { it.id == currentCard.sourceDocId }
                                            if (linkedDoc != null) {
                                                Row(
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(8.dp))
                                                        .background(if (isOfflineCsc) CscSelectedBg else AccentBlue.copy(alpha = 0.12f))
                                                        .then(
                                                            if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(8.dp)) else Modifier
                                                        )
                                                        .clickable { viewModel.openSource(linkedDoc) }
                                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                                ) {
                                                    Icon(
                                                        Icons.Default.MenuBook,
                                                        contentDescription = null,
                                                        tint = if (isOfflineCsc) CscPrimaryBlue else AccentBlue,
                                                        modifier = Modifier.size(14.dp)
                                                    )
                                                    Spacer(modifier = Modifier.width(6.dp))
                                                    Text(
                                                        text = "Study Guide: ${linkedDoc.title}",
                                                        fontSize = if (isOfflineCsc) 12.sp else 11.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = if (isOfflineCsc) CscPrimaryBlue else AccentBlue,
                                                        maxLines = if (isOfflineCsc) 2 else 1
                                                    )
                                                }
                                            } else {
                                                Row(
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(6.dp))
                                                        .background(if (isOfflineCsc) CscSelectedBg else MaterialTheme.colorScheme.surface)
                                                        .then(
                                                            if (isOfflineCsc) Modifier.border(1.dp, CscBorder, RoundedCornerShape(6.dp)) else Modifier
                                                        )
                                                        .padding(horizontal = 10.dp, vertical = 5.dp)
                                                ) {
                                                    Icon(
                                                        Icons.Default.MenuBook,
                                                        contentDescription = null,
                                                        tint = if (isOfflineCsc) CscPrimaryBlue else AccentBlue,
                                                        modifier = Modifier.size(13.dp)
                                                    )
                                                    Spacer(modifier = Modifier.width(6.dp))
                                                    Text(
                                                        text = currentCard.sourceCitation,
                                                        fontSize = if (isOfflineCsc) 12.sp else 10.sp,
                                                        color = if (isOfflineCsc) CscPrimaryBlue else AccentBlue
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            // Recall Quality Rating Buttons (Leitner Algorithm)
                            Column(modifier = Modifier.fillMaxWidth()) {
                                Text(
                                    text = "Rate Recall Quality (Spaced Repetition)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )

                                Spacer(modifier = Modifier.height(6.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Button(
                                        onClick = { viewModel.rateFlashcard(1) },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (isOfflineCsc) CscErrorDark else ErrorRed,
                                            contentColor = Color.White
                                        ),
                                        modifier = Modifier
                                            .weight(1f)
                                            .heightIn(min = 48.dp),
                                        contentPadding = PaddingValues(vertical = 8.dp)
                                    ) {
                                        Text("Again", fontSize = if (isOfflineCsc) 13.sp else 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                    Button(
                                        onClick = { viewModel.rateFlashcard(2) },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (isOfflineCsc) CscWarningDark else WarningAmber,
                                            contentColor = Color.White
                                        ),
                                        modifier = Modifier
                                            .weight(1f)
                                            .heightIn(min = 48.dp),
                                        contentPadding = PaddingValues(vertical = 8.dp)
                                    ) {
                                        Text("Hard", fontSize = if (isOfflineCsc) 13.sp else 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                    Button(
                                        onClick = { viewModel.rateFlashcard(3) },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (isOfflineCsc) CscPrimaryBlue else MaterialTheme.colorScheme.primary,
                                            contentColor = Color.White
                                        ),
                                        modifier = Modifier
                                            .weight(1f)
                                            .heightIn(min = 48.dp),
                                        contentPadding = PaddingValues(vertical = 8.dp)
                                    ) {
                                        Text("Good", fontSize = if (isOfflineCsc) 13.sp else 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                    Button(
                                        onClick = { viewModel.rateFlashcard(5) },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (isOfflineCsc) CscSuccessDark else SuccessGreen,
                                            contentColor = Color.White
                                        ),
                                        modifier = Modifier
                                            .weight(1f)
                                            .heightIn(min = 48.dp),
                                        contentPadding = PaddingValues(vertical = 8.dp)
                                    ) {
                                        Text("Easy", fontSize = if (isOfflineCsc) 13.sp else 11.sp, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Next / Prev Deck Controls
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                OutlinedButton(
                                    onClick = { viewModel.prevFlashcard() },
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
                                    modifier = Modifier.heightIn(min = 48.dp)
                                ) {
                                    Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(15.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Prev Card", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                }
                                OutlinedButton(
                                    onClick = { viewModel.nextFlashcard() },
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
                                    modifier = Modifier.heightIn(min = 48.dp)
                                ) {
                                    Text("Next Card", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(15.dp))
                                }
                            }
                        }
                    }
                }

                // TAB 2: AUDIO BRIEFINGS (Offline Text-to-Speech Briefings)
                2 -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        contentPadding = PaddingValues(top = 16.dp, bottom = 80.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        item {
                            Text(
                                text = if (isOfflineCsc) {
                                    "Offline Audio Briefings (${audioOverviews.size})"
                                } else {
                                    "AI Audio Deep Dives (${audioOverviews.size})"
                                },
                                fontSize = if (isOfflineCsc) 18.sp else 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                            Text(
                                text = if (isOfflineCsc) {
                                    "Domain overviews and individual topic lessons with transcripts"
                                } else {
                                    "2-Host podcast briefings powered by Text-to-Speech"
                                },
                                fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        if (audioOverviews.isEmpty()) {
                            item {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(14.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                                    elevation = CardDefaults.cardElevation(0.dp)
                                ) {
                                    Text(
                                        text = "No audio briefings are installed in this edition yet.",
                                        fontSize = 14.sp,
                                        lineHeight = 20.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.padding(16.dp)
                                    )
                                }
                            }
                        }

                        items(audioOverviews, key = { it.id }) { audio ->
                            if (isOfflineCsc && audio.topicId == null) {
                                Text(
                                    text = audio.title,
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onBackground,
                                    modifier = Modifier.padding(top = 4.dp, bottom = 8.dp)
                                )
                            }
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(14.dp))
                                    .clickable { viewModel.openAudioOverview(audio) }
                                    .testTag("audio_item_${audio.id}"),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                                elevation = CardDefaults.cardElevation(if (isOfflineCsc) 0.dp else 2.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(42.dp)
                                                    .clip(CircleShape)
                                                    .background(if (isOfflineCsc) CscSelectedBg else AccentCyan.copy(alpha = 0.15f))
                                                    .then(
                                                        if (isOfflineCsc) Modifier.border(1.dp, CscBorder, CircleShape) else Modifier
                                                    ),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Icon(
                                                    Icons.Default.Headphones,
                                                    contentDescription = null,
                                                    tint = if (isOfflineCsc) CscPrimaryBlue else AccentCyan
                                                )
                                            }
                                            Spacer(modifier = Modifier.width(12.dp))
                                            Column {
                                                Text(
                                                    text = if (isOfflineCsc && audio.topicId == null) "Domain overview" else audio.title,
                                                    fontSize = 15.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = MaterialTheme.colorScheme.onSurface
                                                )
                                                Text(
                                                    text = if (isOfflineCsc) {
                                                        val duration = audio.durationSeconds
                                                        val minutes = duration / 60
                                                        val seconds = (duration % 60).toString().padStart(2, '0')
                                                        "$minutes:$seconds"
                                                    } else {
                                                        "${audio.host1} & ${audio.host2}"
                                                    },
                                                    fontSize = 12.sp,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                                )
                                            }
                                        }

                                        Spacer(modifier = Modifier.width(8.dp))

                                        Box(
                                            modifier = Modifier
                                                .size(40.dp)
                                                .clip(CircleShape)
                                                .background(MaterialTheme.colorScheme.primary),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(Icons.Default.PlayArrow, contentDescription = "Play", tint = Color.White)
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text(
                                        text = audio.subtitle,
                                        fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                                        lineHeight = 19.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Modal Bottom Sheet: Source Document Reader
    if (selectedSource != null) {
        val doc = selectedSource!!
        ModalBottomSheet(
            onDismissRequest = { viewModel.closeSource() },
            containerColor = MaterialTheme.colorScheme.surface,
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        ) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = doc.title,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { viewModel.closeSource() }) {
                            Icon(Icons.Default.Close, contentDescription = "Close")
                        }
                    }
                    Text(
                        text = doc.authorOrStandard,
                        fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isOfflineCsc) CscCreamSecondary else MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                        ),
                        border = if (isOfflineCsc) BorderStroke(1.dp, CscBorder) else null,
                        elevation = CardDefaults.cardElevation(0.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = if (isOfflineCsc) "Executive Summary" else "AI Executive Summary",
                                fontSize = if (isOfflineCsc) 13.sp else 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = doc.summary,
                                fontSize = 14.sp,
                                color = if (isOfflineCsc) CscTextPrimary else MaterialTheme.colorScheme.onPrimaryContainer,
                                lineHeight = 20.sp
                            )
                        }
                    }
                }

                item {
                    Text("Key Takeaways for Exam", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }

                items(doc.keyTakeaways) { takeaway ->
                    Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top) {
                        Box(
                            modifier = Modifier
                                .padding(top = 7.dp)
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primary)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = takeaway,
                            fontSize = if (isOfflineCsc) 14.sp else 13.sp,
                            color = MaterialTheme.colorScheme.onSurface,
                            lineHeight = 20.sp
                        )
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Full Syllabus Document", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = doc.fullContent,
                        fontSize = if (isOfflineCsc) 14.sp else 12.sp,
                        color = if (isOfflineCsc) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 21.sp
                    )
                }

                if (!isOfflineCsc) {
                    item {
                        Button(
                            onClick = {
                                viewModel.closeSource()
                                viewModel.sendAIPrompt("I just reviewed '${doc.title}'. Can you quiz me with 3 high-yield scenario questions?")
                                viewModel.navigateTo(AppScreen.AI_TUTOR)
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Quiz Me on This Source")
                        }
                    }
                }
            }
        }
    }

    // Add Source Dialog
    if (showAddSourceDialog) {
        var newTitle by remember { mutableStateOf("") }
        var newSummary by remember { mutableStateOf("") }
        var newContent by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showAddSourceDialog = false },
            containerColor = MaterialTheme.colorScheme.surface,
            title = { Text("Add Study Notes") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = newTitle,
                        onValueChange = { newTitle = it },
                        label = { Text("Chapter / Document Title") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newSummary,
                        onValueChange = { newSummary = it },
                        label = { Text("Summary") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = newContent,
                        onValueChange = { newContent = it },
                        label = { Text("Full Notes / Markdown") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTitle.isNotEmpty()) {
                            val domainId = viewModel.currentExam.value.domains.firstOrNull()?.id
                                ?: if (isOfflineCsc) "csc-part-1-general" else "d1"
                            viewModel.addSourceDoc(
                                title = newTitle,
                                summary = newSummary.ifBlank { "Personal study notes" },
                                takeaways = listOf("Custom added study material cached locally for offline review"),
                                content = newContent.ifBlank { newSummary },
                                domainId = domainId
                            )
                            showAddSourceDialog = false
                        }
                    },
                    modifier = Modifier.heightIn(min = 48.dp)
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showAddSourceDialog = false },
                    modifier = Modifier.heightIn(min = 48.dp)
                ) { Text("Cancel") }
            }
        )
    }

    if (!isOfflineCsc && showAddFlashcardDialog) {
        var frontPrompt by remember { mutableStateOf("") }
        var backAnswer by remember { mutableStateOf("") }
        var topicLabel by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showAddFlashcardDialog = false },
            containerColor = MaterialTheme.colorScheme.surface,
            title = { Text("Create Flashcard") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = frontPrompt,
                        onValueChange = { frontPrompt = it },
                        label = { Text("Question / Prompt") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = backAnswer,
                        onValueChange = { backAnswer = it },
                        label = { Text("Answer / Key Rule") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp)
                    )
                    OutlinedTextField(
                        value = topicLabel,
                        onValueChange = { topicLabel = it },
                        label = { Text("Domain / Topic (Optional)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (frontPrompt.isNotBlank() && backAnswer.isNotBlank()) {
                            viewModel.addFlashcard(
                                frontPrompt = frontPrompt.trim(),
                                backAnswer = backAnswer.trim(),
                                keyRule = backAnswer.trim(),
                                domainId = topicLabel.trim()
                            )
                            showAddFlashcardDialog = false
                        }
                    },
                    modifier = Modifier.heightIn(min = 48.dp)
                ) {
                    Text("Save Card")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showAddFlashcardDialog = false },
                    modifier = Modifier.heightIn(min = 48.dp)
                ) { Text("Cancel") }
            }
        )
    }
}
