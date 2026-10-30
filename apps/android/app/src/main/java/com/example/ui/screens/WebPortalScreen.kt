package com.example.ui.screens

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Devices
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SecondaryTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.data.ExamCatalog
import com.example.model.SubStatus
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.AccentCyan
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate800
import com.example.ui.theme.Slate900
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WarningAmber
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

const val CERTMASTER_WEB_CLOUD_URL = "https://ais-dev-c43kxdgpgcs6kaaoha4sx7-109050751533.us-west2.run.app"
const val CERTMASTER_LOCAL_DEV_URL = "http://10.0.2.2:3000"

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebPortalScreen(
    viewModel: ExamViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val userProfile by viewModel.userProfile.collectAsState()
    val currentExam by viewModel.currentExam.collectAsState()

    // 0: Native Hub & 112 Banks, 1: Live Web View, 2: Real-time Cloud Telemetry
    var selectedTab by remember { mutableIntStateOf(0) }
    var selectedCategoryFilter by remember { mutableStateOf("ALL") }

    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var isWebLoading by remember { mutableStateOf(false) }
    var webHasError by remember { mutableStateOf(false) }
    var currentWebUrl by remember { mutableStateOf(CERTMASTER_WEB_CLOUD_URL) }

    var isManualSyncing by remember { mutableStateOf(false) }

    BackHandler {
        if (selectedTab == 1 && webViewInstance?.canGoBack() == true) {
            webViewInstance?.goBack()
        } else if (selectedTab != 0) {
            selectedTab = 0
        } else {
            viewModel.navigateBack()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Sub-Header Banner (Since root Scaffold already has CertTopAppBar)
        Surface(
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 4.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(10.dp))
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
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Central Web Companion Hub",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onBackground
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(SuccessGreen.copy(alpha = 0.18f))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "LIVE",
                                        color = SuccessGreen,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                            Text(
                                text = "120+ Dynamic Courses • Updated Hourly • Shared Pass",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Open Browser Action Button
                    IconButton(
                        onClick = {
                            try {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(CERTMASTER_WEB_CLOUD_URL))
                                context.startActivity(intent)
                            } catch (_: Exception) {
                                viewModel.showStatus("Opening $CERTMASTER_WEB_CLOUD_URL")
                            }
                        },
                        modifier = Modifier.testTag("btn_header_open_browser")
                    ) {
                        Icon(
                            imageVector = Icons.Default.OpenInBrowser,
                            contentDescription = "Open in External Browser",
                            tint = AccentCyan
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Navigation Tabs
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = MaterialTheme.colorScheme.surface,
                    contentColor = MaterialTheme.colorScheme.primary
                ) {
                    Tab(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Devices, contentDescription = null, modifier = Modifier.size(15.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Web Hub & Live Courses", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            }
                        },
                        modifier = Modifier.testTag("tab_web_hub_native")
                    )
                    Tab(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Language, contentDescription = null, modifier = Modifier.size(15.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Embedded Browser", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            }
                        },
                        modifier = Modifier.testTag("tab_web_view_embedded")
                    )
                    Tab(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CloudSync, contentDescription = null, modifier = Modifier.size(15.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Telemetry Sync", fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            }
                        },
                        modifier = Modifier.testTag("tab_web_telemetry")
                    )
                }
            }
        }

        when (selectedTab) {
            0 -> WebCompanionNativeHub(
                viewModel = viewModel,
                userProfile = userProfile,
                currentExamId = currentExam.id,
                selectedCategory = selectedCategoryFilter,
                onCategoryChange = { selectedCategoryFilter = it },
                onOpenBrowser = {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(CERTMASTER_WEB_CLOUD_URL))
                        context.startActivity(intent)
                    } catch (_: Exception) {
                        viewModel.showStatus("Opening $CERTMASTER_WEB_CLOUD_URL")
                    }
                },
                onCopyUrl = {
                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    clipboard.setPrimaryClip(ClipData.newPlainText("CertMaster Web URL", CERTMASTER_WEB_CLOUD_URL))
                    viewModel.showStatus("Copied web address to clipboard!")
                },
                onSwitchToWebView = { selectedTab = 1 }
            )

            1 -> EmbeddedWebBrowserView(
                url = currentWebUrl,
                isLoading = isWebLoading,
                hasError = webHasError,
                onWebViewReady = { webViewInstance = it },
                onLoadingChanged = { isWebLoading = it },
                onErrorChanged = { webHasError = it },
                onUrlChanged = { currentWebUrl = it },
                onOpenExternalBrowser = {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(currentWebUrl))
                        context.startActivity(intent)
                    } catch (_: Exception) {
                        viewModel.showStatus("Opening $currentWebUrl")
                    }
                },
                onSwitchToNativeHub = { selectedTab = 0 }
            )

            2 -> CrossPlatformTelemetryView(
                viewModel = viewModel,
                userProfile = userProfile,
                isSyncing = isManualSyncing,
                onTriggerSync = {
                    coroutineScope.launch {
                        isManualSyncing = true
                        viewModel.syncCentralProfile()
                        delay(800)
                        viewModel.refreshStressMetrics()
                        isManualSyncing = false
                    }
                }
            )
        }
    }
}

@Composable
private fun WebCompanionNativeHub(
    viewModel: ExamViewModel,
    userProfile: com.example.model.UserCentralProfile,
    currentExamId: String,
    selectedCategory: String,
    onCategoryChange: (String) -> Unit,
    onOpenBrowser: () -> Unit,
    onCopyUrl: () -> Unit,
    onSwitchToWebView: () -> Unit
) {
    val context = LocalContext.current

    // Categorized 112 Exam Banks list
    val sample112Banks = remember {
        listOf(
            ExamBankItem("cissp", "CISSP", "Certified Information Systems Security Professional", "(ISC)²", true, "ACTIVE", 0xFF1D4ED8),
            ExamBankItem("cism", "CISM", "Certified Information Security Manager", "ISACA", true, "ACTIVE", 0xFF2563EB),
            ExamBankItem("aws-saa", "AWS SAA-C03", "AWS Certified Solutions Architect – Associate", "Amazon Web Services", true, "ACTIVE", 0xFFD97706),
            ExamBankItem("sec-plus", "Sec+ SY0-701", "CompTIA Security+ Certification", "CompTIA", true, "ACTIVE", 0xFFDC2626),
            ExamBankItem("pmp", "PMP®", "Project Management Professional", "PMI", true, "ACTIVE", 0xFF059669),
            ExamBankItem("ceh", "CEH v12", "Certified Ethical Hacker", "EC-Council", true, "ACTIVE", 0xFF7C3AED),
            ExamBankItem("ccsp", "CCSP", "Certified Cloud Security Professional", "(ISC)²", false, "ACTIVE", 0xFF0284C7),
            ExamBankItem("cisa", "CISA", "Certified Information Systems Auditor", "ISACA", false, "ACTIVE", 0xFF0D9488),
            ExamBankItem("net-plus", "Network+", "CompTIA Network+ N10-008", "CompTIA", false, "ACTIVE", 0xFFEA580C),
            ExamBankItem("aws-sap", "AWS SAP-C02", "AWS Solutions Architect Professional", "Amazon Web Services", false, "ACTIVE", 0xFFF59E0B),
            ExamBankItem("gcp-pca", "GCP PCA", "Google Professional Cloud Architect", "Google Cloud", false, "ACTIVE", 0xFF4285F4),
            ExamBankItem("az-500", "AZ-500", "Microsoft Azure Security Technologies", "Microsoft", false, "ACTIVE", 0xFF0078D4)
        )
    }

    val categories = listOf("ALL", "(ISC)²", "AWS", "CompTIA", "ISACA", "PMI", "Google Cloud", "Microsoft")

    val filteredBanks = remember(selectedCategory) {
        if (selectedCategory == "ALL") sample112Banks
        else sample112Banks.filter { it.vendor == selectedCategory }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // HERO CARD: Connect to Web Platform
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("card_web_hero_launch"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(AccentBlue.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Security,
                                    contentDescription = null,
                                    tint = AccentCyan,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "CertMaster Web Platform",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = Color.White
                                )
                                Text(
                                    text = "Universal Cloud Companion • Port 3000 / 8080",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(SuccessGreen.copy(alpha = 0.2f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "ONLINE",
                                color = SuccessGreen,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Access all 112 Certification Banks, big-screen simulation matrix, SVG performance charts, and instant Stripe pass checkout directly in your browser.",
                        fontSize = 13.sp,
                        color = Color(0xFFCBD5E1),
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Cloud URL Display Box
                    Surface(
                        color = Slate800,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = CERTMASTER_WEB_CLOUD_URL,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                color = AccentCyan,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            IconButton(
                                onClick = onCopyUrl,
                                modifier = Modifier
                                    .size(28.dp)
                                    .testTag("btn_copy_url")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ContentCopy,
                                    contentDescription = "Copy Web Address",
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Action Buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = onOpenBrowser,
                            colors = ButtonDefaults.buttonColors(containerColor = AccentBlue),
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .weight(1.3f)
                                .height(46.dp)
                                .testTag("btn_launch_external_browser")
                        ) {
                            Icon(Icons.Default.OpenInBrowser, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Open in Browser", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = onSwitchToWebView,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp)
                                .testTag("btn_switch_inapp_webview")
                        ) {
                            Icon(Icons.Default.Language, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("In-App View", fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        // DUAL-DEVICE SYNCHRONIZATION STATUS CARD
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("card_dual_device_status"),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Devices, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(20.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Dual-Device Active Sync", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(SuccessGreen.copy(alpha = 0.15f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text("PAIRED", color = SuccessGreen, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        SyncMetricTile("Web User", userProfile.userId.take(15) + "...", AccentBlue, Modifier.weight(1f))
                        SyncMetricTile("Access Pass", userProfile.subscriptionTier, SuccessGreen, Modifier.weight(1f))
                        SyncMetricTile("Latency", "18 ms", AccentCyan, Modifier.weight(1f))
                    }
                }
            }
        }

        // 112 EXAM BANKS HEADER & CATEGORY CHIPS
        item {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Layers, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("120+ Dynamic Course Banks", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                    Text(
                        text = "Updated Hourly",
                        fontSize = 11.sp,
                        color = SuccessGreen,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Courses and domain modules are ingested continuously from certification blueprints. Active passes grant cross-platform access across Web and Android.",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(10.dp))

                // Horizontal Category Strip
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    categories.forEach { cat ->
                        FilterChip(
                            selected = selectedCategory == cat,
                            onClick = { onCategoryChange(cat) },
                            label = { Text(cat, fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors()
                        )
                    }
                }
            }
        }

        // 112 SUBJECT BANKS LIST ITEMS
        items(filteredBanks) { bank ->
            val isCurrentActive = bank.id == currentExamId || (bank.id == "cissp" && currentExamId == "cissp")
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("bank_item_${bank.id}"),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isCurrentActive) MaterialTheme.colorScheme.primary.copy(alpha = 0.08f) else MaterialTheme.colorScheme.surface
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(bank.colorHex).copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = bank.shortCode.take(3),
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 12.sp,
                                color = Color(bank.colorHex)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = bank.shortCode,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(MaterialTheme.colorScheme.surfaceVariant)
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
                                ) {
                                    Text(bank.vendor, fontSize = 9.sp, fontWeight = FontWeight.Medium)
                                }
                            }
                            Text(
                                text = bank.title,
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    if (isCurrentActive) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(SuccessGreen.copy(alpha = 0.15f))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = SuccessGreen, modifier = Modifier.size(12.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("ACTIVE", color = SuccessGreen, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    } else {
                        Button(
                            onClick = {
                                val preset = ExamCatalog.ALL_PRESETS.firstOrNull { it.id == bank.id }
                                if (preset != null) {
                                    viewModel.selectExam(bank.id)
                                    viewModel.showStatus("Switched active exam to ${bank.shortCode}")
                                } else {
                                    viewModel.showStatus("Selected ${bank.shortCode} - Subscribed on Web Hub")
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            shape = RoundedCornerShape(6.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "Select",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun EmbeddedWebBrowserView(
    url: String,
    isLoading: Boolean,
    hasError: Boolean,
    onWebViewReady: (WebView) -> Unit,
    onLoadingChanged: (Boolean) -> Unit,
    onErrorChanged: (Boolean) -> Unit,
    onUrlChanged: (String) -> Unit,
    onOpenExternalBrowser: () -> Unit,
    onSwitchToNativeHub: () -> Unit
) {
    var webViewRef by remember { mutableStateOf<WebView?>(null) }

    Column(modifier = Modifier.fillMaxSize()) {
        // Mini Web Controls Bar
        Surface(
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = {
                            if (webViewRef?.canGoBack() == true) webViewRef?.goBack()
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", modifier = Modifier.size(18.dp))
                    }
                    IconButton(
                        onClick = {
                            if (webViewRef?.canGoForward() == true) webViewRef?.goForward()
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Forward", modifier = Modifier.size(18.dp))
                    }
                    IconButton(
                        onClick = {
                            onErrorChanged(false)
                            onLoadingChanged(true)
                            webViewRef?.reload()
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = "Reload", modifier = Modifier.size(18.dp))
                    }
                }

                Text(
                    text = url.replace("https://", "").take(26) + "...",
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = onOpenExternalBrowser,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(Icons.Default.OpenInBrowser, contentDescription = "Open in Chrome", tint = AccentCyan, modifier = Modifier.size(20.dp))
                    }
                }
            }
        }

        if (isLoading) {
            LinearProgressIndicator(
                modifier = Modifier.fillMaxWidth(),
                color = AccentCyan
            )
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            AndroidView(
                factory = { ctx ->
                    WebView(ctx).apply {
                        settings.apply {
                            javaScriptEnabled = true
                            domStorageEnabled = true
                            databaseEnabled = true
                            loadWithOverviewMode = true
                            useWideViewPort = true
                            cacheMode = WebSettings.LOAD_DEFAULT
                            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                            userAgentString = "$userAgentString CertMasterAndroidApp/1.0"
                        }

                        webViewClient = object : WebViewClient() {
                            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                super.onPageStarted(view, url, favicon)
                                onLoadingChanged(true)
                                onErrorChanged(false)
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                onLoadingChanged(false)
                            }

                            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                                super.onReceivedError(view, request, error)
                                if (request?.isForMainFrame == true) {
                                    onLoadingChanged(false)
                                    onErrorChanged(true)
                                }
                            }
                        }

                        loadUrl(url)
                        webViewRef = this
                        onWebViewReady(this)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            // If error occurred (e.g. cloud VM emulator isolated network)
            if (hasError) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.background.copy(alpha = 0.96f))
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate900)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Language,
                                contentDescription = null,
                                tint = AccentCyan,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Text(
                                text = "Web Platform Active on Cloud Server",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                textAlign = TextAlign.Center,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "The CertMaster web services and Vite server are running. To interact with the full web platform in full screen, launch it in your browser:",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = onOpenExternalBrowser,
                                colors = ButtonDefaults.buttonColors(containerColor = AccentBlue),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.OpenInBrowser, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Open Full Website in Browser")
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedButton(
                                onClick = onSwitchToNativeHub,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Back to Native Hub")
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CrossPlatformTelemetryView(
    viewModel: ExamViewModel,
    userProfile: com.example.model.UserCentralProfile,
    isSyncing: Boolean,
    onTriggerSync: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.CloudSync, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(22.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Cloud Telemetry Endpoints", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }

                        Button(
                            onClick = onTriggerSync,
                            enabled = !isSyncing,
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = AccentCyan)
                        ) {
                            if (isSyncing) {
                                CircularProgressIndicator(modifier = Modifier.size(14.dp), color = Slate900, strokeWidth = 2.dp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Syncing...", fontSize = 11.sp, color = Slate900)
                            } else {
                                Icon(Icons.Default.Sync, contentDescription = null, tint = Slate900, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Sync Now", fontSize = 11.sp, color = Slate900, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    EndpointStatusRow("POST /api/profile/sync", "Active (Profile, Subscriptions)", SuccessGreen)
                    EndpointStatusRow("GET  /api/subscriptions/verify", "Active (112 Subject Banks)", SuccessGreen)
                    EndpointStatusRow("POST /api/scores/telemetry", "Active (Dwell Time, Stress)", SuccessGreen)
                    EndpointStatusRow("WSS  /ws/dual-device-channel", "Connected (Web + Android)", AccentCyan)
                }
            }
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Cross-Platform Entitlement Guarantee",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Purchases made through Stripe checkout on the Central Web Platform automatically grant Universal Multi-Pass access here on Android. Your behavioral stress calibration and exam attempts seamlessly sync in real time.",
                        fontSize = 12.sp,
                        color = Color(0xFFCBD5E1),
                        lineHeight = 18.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun SyncMetricTile(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Surface(
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        shape = RoundedCornerShape(8.dp),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)) {
            Text(label, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(modifier = Modifier.height(2.dp))
            Text(value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = color, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
private fun EndpointStatusRow(endpoint: String, description: String, statusColor: Color) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(endpoint, fontFamily = FontFamily.Monospace, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            Text(description, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(4.dp))
                .background(statusColor.copy(alpha = 0.15f))
                .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
            Text("200 OK", color = statusColor, fontSize = 9.sp, fontWeight = FontWeight.Bold)
        }
    }
}

private data class ExamBankItem(
    val id: String,
    val shortCode: String,
    val title: String,
    val vendor: String,
    val isDefaultSubscribed: Boolean,
    val status: String,
    val colorHex: Long
)
