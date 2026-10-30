package com.example.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Payment
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.SubStatus
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.AccentCyan
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WarningAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CentralProfileScreen(
    viewModel: ExamViewModel,
    modifier: Modifier = Modifier
) {
    val userProfile by viewModel.userProfile.collectAsState()
    val ssoSession by viewModel.ssoSession.collectAsState()
    val readinessReport by viewModel.readinessReport.collectAsState()
    val studyPlanMilestones by viewModel.studyPlanMilestones.collectAsState()
    val syncLogs by viewModel.syncLogs.collectAsState()
    val pendingSyncCount by viewModel.pendingSyncCount.collectAsState()
    val context = LocalContext.current

    var profileTab by remember { mutableIntStateOf(0) } // 0: Universal Subscriptions, 1: Knowledge Profile & 5-Stage Plan, 2: Web Companion Sync

    BackHandler {
        viewModel.navigateTo(AppScreen.DASHBOARD)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        TopAppBar(
            title = {
                Column {
                    Text("Central Profile & Cloud Hub", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text("Universal Login • Web & Mobile Synchronized", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            },
            navigationIcon = {
                IconButton(
                    onClick = { viewModel.navigateTo(AppScreen.DASHBOARD) },
                    modifier = Modifier.testTag("btn_back_profile")
                ) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Return to Dashboard")
                }
            },
            actions = {
                IconButton(
                    onClick = { viewModel.syncCentralProfile() },
                    modifier = Modifier.testTag("btn_sync_central")
                ) {
                    Icon(Icons.Default.CloudSync, contentDescription = "Sync Cloud Profile", tint = MaterialTheme.colorScheme.primary)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.surface)
        )

        // Account Header Hero
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = "User Avatar",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(32.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = userProfile.displayName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(SuccessGreen.copy(alpha = 0.15f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = if (ssoSession.isAuthenticated) "SSO AUTHENTICATED" else "OFFLINE CACHE",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = SuccessGreen
                            )
                        }
                    }
                    Text(
                        text = userProfile.email,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "ID: ${userProfile.userId} • Readiness: ${readinessReport.readinessPercent}% (Stage ${readinessReport.currentJourneyStage}/5)",
                        fontSize = 10.sp,
                        color = Slate400
                    )
                }
            }
        }

        // Screen Navigation Tabs
        TabRow(
            selectedTabIndex = profileTab,
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.primary
        ) {
            Tab(
                selected = profileTab == 0,
                onClick = { profileTab = 0 },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Payment, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Subscriptions", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                },
                modifier = Modifier.testTag("tab_subscriptions")
            )
            Tab(
                selected = profileTab == 1,
                onClick = { profileTab = 1 },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Psychology, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Behavior Profile", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                },
                modifier = Modifier.testTag("tab_behavior_profile")
            )
            Tab(
                selected = profileTab == 2,
                onClick = { profileTab = 2 },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Devices, contentDescription = null, modifier = Modifier.size(15.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Web Platform", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                },
                modifier = Modifier.testTag("tab_web_platform")
            )
        }

        when (profileTab) {
            // TAB 0: UNIVERSAL PAY-PER-SUBJECT SUBSCRIPTIONS
            0 -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    contentPadding = PaddingValues(top = 14.dp, bottom = 28.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Devices,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(24.dp)
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(
                                            text = "Universal Cross-Platform Access (${userProfile.subscriptionTier})",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                        Text(
                                            text = "Once subscribed on Web or Mobile, access is unlocked on all platforms.",
                                            fontSize = 11.sp,
                                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.85f)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    item {
                        Text(
                            text = "Pay-Per-Subject Entitlements (120+ Exam Banks)",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }

                    items(userProfile.subscriptions) { sub ->
                        val isSubscribed = sub.status == SubStatus.ACTIVE
                        val statusColor = when (sub.status) {
                            SubStatus.ACTIVE -> SuccessGreen
                            SubStatus.TRIAL_ACTIVE -> WarningAmber
                            SubStatus.LOCKED -> Slate600
                            SubStatus.EXPIRED -> Slate400
                        }

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
                                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                                        Icon(
                                            imageVector = if (isSubscribed) Icons.Default.LockOpen else Icons.Default.Lock,
                                            contentDescription = null,
                                            tint = statusColor,
                                            modifier = Modifier.size(20.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Column {
                                            Text(sub.shortCode, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                            Text(sub.examTitle, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
                                        }
                                    }

                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(statusColor.copy(alpha = 0.15f))
                                            .padding(horizontal = 8.dp, vertical = 3.dp)
                                    ) {
                                        Text(
                                            text = when (sub.status) {
                                                SubStatus.ACTIVE -> "UNLOCKED"
                                                SubStatus.TRIAL_ACTIVE -> "TRIAL"
                                                SubStatus.LOCKED -> sub.priceFormatted
                                                SubStatus.EXPIRED -> "EXPIRED"
                                            },
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = statusColor
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "Source: ${sub.subscribedPlatform}",
                                            fontSize = 10.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        Text(
                                            text = "Universal Access: Web, Android, iOS Sync Enabled",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = if (isSubscribed) SuccessGreen else Slate400
                                        )
                                    }

                                    if (!isSubscribed) {
                                        Button(
                                            onClick = { viewModel.subscribeToExam(sub.examId) },
                                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                            shape = RoundedCornerShape(8.dp),
                                            modifier = Modifier.testTag("btn_unlock_${sub.examId}")
                                        ) {
                                            Text("Subscribe (${sub.priceFormatted})", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    } else {
                                        OutlinedButton(
                                            onClick = {
                                                viewModel.selectExam(sub.examId)
                                            },
                                            shape = RoundedCornerShape(8.dp)
                                        ) {
                                            Text("Launch Prep", fontSize = 11.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // TAB 1: CUSTOMER BEHAVIOR, AUTHORITATIVE READINESS & 5-STAGE STUDY PLAN
            1 -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    contentPadding = PaddingValues(top = 14.dp, bottom = 28.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(2.dp)
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
                                            Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(20.dp))
                                        }
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Column {
                                            Text("Assessment Knowledge Baseline", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                            Text("Shared authoritative formula with CertMaster Web", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        }
                                    }

                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(SuccessGreen.copy(alpha = 0.15f))
                                            .padding(horizontal = 8.dp, vertical = 3.dp)
                                    ) {
                                        Text(
                                            text = if (readinessReport.passGuaranteeQualified) "PASS GUARANTEE" else "ACTIVE",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = SuccessGreen
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.height(14.dp))

                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                            .padding(10.dp)
                                    ) {
                                        Column {
                                            Text("Baseline Score", fontSize = 10.sp, color = Slate400)
                                            Text("${userProfile.assessmentScorePercent}%", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                                        }
                                    }

                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                            .padding(10.dp)
                                    ) {
                                        Column {
                                            Text("Cognitive Stress Index", fontSize = 10.sp, color = Slate400)
                                            Text("${userProfile.cognitiveStressBaseline}/100", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = WarningAmber)
                                        }
                                    }

                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                            .padding(10.dp)
                                    ) {
                                        Column {
                                            Text("Exam Readiness", fontSize = 10.sp, color = Slate400)
                                            Text("${readinessReport.readinessPercent}%", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = SuccessGreen)
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(12.dp))

                                Text(
                                    text = "Behavioral Archetype: ${userProfile.behavioralArchetype}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = userProfile.hesitationNotes,
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    lineHeight = 16.sp
                                )

                                Spacer(modifier = Modifier.height(14.dp))

                                Button(
                                    onClick = { viewModel.startAssessmentExam() },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("btn_retake_assessment"),
                                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                                ) {
                                    Icon(Icons.Default.Psychology, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Retake Assessment Exam to Recalibrate Profile")
                                }
                            }
                        }
                    }

                    // Synchronized 5-Stage Mastery Study Plan
                    item {
                        Text(
                            text = "Synchronized 5-Stage Mastery Study Plan",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }

                    items(studyPlanMilestones) { milestone ->
                        val stageColor = when (milestone.status) {
                            "COMPLETED" -> SuccessGreen
                            "IN_PROGRESS", "READY" -> AccentBlue
                            else -> Slate400
                        }
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
                                    Text(
                                        text = "Stage ${milestone.stage}: ${milestone.stageName}",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(stageColor.copy(alpha = 0.15f))
                                            .padding(horizontal = 8.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = milestone.status,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = stageColor
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = milestone.description,
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            // TAB 2: CENTRAL WEB PLATFORM COMPANION & SHARED SSO
            2 -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    contentPadding = PaddingValues(top = 14.dp, bottom = 28.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
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
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(AccentBlue.copy(alpha = 0.15f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.Language, contentDescription = null, tint = AccentBlue, modifier = Modifier.size(24.dp))
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text("Central Web Portal Companion", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                                        Text("Shared Firebase & OIDC Ecosystem • Queued Ops: $pendingSyncCount", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }

                                Spacer(modifier = Modifier.height(12.dp))

                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                        .padding(10.dp)
                                ) {
                                    Column {
                                        Text("Central Portal Endpoint:", fontSize = 10.sp, color = Slate400)
                                        Text(userProfile.centralPortalUrl, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.primary)
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text("SSO Provider: ${ssoSession.provider} (${ssoSession.clientId})", fontSize = 10.sp, color = Slate400)
                                    }
                                }

                                Spacer(modifier = Modifier.height(12.dp))

                                Text(
                                    text = "11 Synchronized Ecosystem Domains:",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(6.dp))

                                val syncItems = listOf(
                                    "1. Student Profiles & Shared Google OIDC SSO Identity",
                                    "2. Certification Catalog (120+ Dynamic Exam Banks)",
                                    "3. Question Banks with Option Analysis & Grounded Citations",
                                    "4. Exam Attempts, Simulation Scores & Domain Breakdowns",
                                    "5. 5-Stage Mastery Study Plans & Test Day Checklists",
                                    "6. Progress Tracking, Streaks & Completion Milestones",
                                    "7. AI-Generated Learning Content (NotebookLM Guides & Audio)",
                                    "8. Spaced-Repetition Flashcards (Leitner Box & Review Status)",
                                    "9. Performance Analytics & Domain Cognitive Stress Telemetry",
                                    "10. Authoritative Exam Readiness & Pass Guarantee Status",
                                    "11. Universal Subscription Entitlements (Web + Android)"
                                )

                                syncItems.forEach { itemText ->
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 2.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = SuccessGreen, modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(itemText, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }

                                Spacer(modifier = Modifier.height(14.dp))

                                Button(
                                    onClick = { viewModel.syncCentralProfile() },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("btn_force_cloud_sync")
                                ) {
                                    Icon(Icons.Default.CloudSync, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Force Instant Cloud Sync Now")
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedButton(
                                    onClick = { viewModel.authenticateWithGoogleSso(context) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .testTag("btn_google_sso_handshake")
                                ) {
                                    Icon(Icons.Default.VerifiedUser, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Verify / Refresh Google SSO Credential")
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedButton(
                                    onClick = {
                                        val browserIntent = Intent(
                                            Intent.ACTION_VIEW,
                                            Uri.parse("https://ais-dev-c43kxdgpgcs6kaaoha4sx7-109050751533.us-west2.run.app")
                                        )
                                        context.startActivity(browserIntent)
                                    },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Default.Language, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Open Live Website In Browser")
                                }
                            }
                        }
                    }

                    // Recent Sync Audit Logs
                    item {
                        Text(
                            text = "Cross-Platform Sync Audit Trail",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                    }

                    items(syncLogs.take(5)) { log ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "${log.source} • ${log.direction}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                    Text(
                                        text = log.status,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = SuccessGreen
                                    )
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(log.message, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                                Text(log.payloadSummary, fontSize = 10.sp, color = Slate400)
                            }
                        }
                    }
                }
            }
        }
    }
}
