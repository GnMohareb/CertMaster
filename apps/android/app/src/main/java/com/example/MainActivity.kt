package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.AppScreen
import com.example.ui.ExamViewModel
import com.example.ui.components.CertBottomNav
import com.example.ui.components.CertTopAppBar
import com.example.ui.screens.AITutorScreen
import com.example.ui.screens.AudioOverviewScreen
import com.example.ui.screens.BackendSettingsScreen
import com.example.ui.screens.CentralProfileScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.ExamResultScreen
import com.example.ui.screens.ExamSelectorScreen
import com.example.ui.screens.ExamSimulationScreen
import com.example.ui.screens.ExamsHubScreen
import com.example.ui.screens.FlashcardsScreen
import com.example.ui.screens.NotebookSourcesScreen
import com.example.ui.screens.WebPortalScreen
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val isCscFlavor = BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-")
        if (isCscFlavor) {
            val warmScrim = android.graphics.Color.rgb(0xFA, 0xF9, 0xF6)
            val navScrim = android.graphics.Color.rgb(0xFF, 0xFF, 0xFF)
            enableEdgeToEdge(
                statusBarStyle = SystemBarStyle.light(warmScrim, warmScrim),
                navigationBarStyle = SystemBarStyle.light(navScrim, navScrim)
            )
        } else {
            enableEdgeToEdge()
        }
        setContent {
            MyApplicationTheme {
                CertMasterApp()
            }
        }
    }
}

@Composable
fun CertMasterApp(viewModel: ExamViewModel = viewModel()) {
    val currentScreen by viewModel.currentScreen.collectAsState()
    val currentExam by viewModel.currentExam.collectAsState()
    val backendConfig by viewModel.backendConfig.collectAsState()
    val statusMessage by viewModel.statusMessage.collectAsState()

    // The standalone CSC application must never report backend connectivity as available.
    val isOfflineCsc = BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-")
    val blockedOfflineScreens = setOf(
        AppScreen.AI_TUTOR, AppScreen.WEB_PORTAL, AppScreen.BACKEND_SETTINGS,
        AppScreen.CENTRAL_PROFILE, AppScreen.EXAM_SELECTOR
    )
    val visibleScreen = if (isOfflineCsc && currentScreen in blockedOfflineScreens) AppScreen.DASHBOARD else currentScreen
    val navigateOfflineSafe: (AppScreen) -> Unit = { target ->
        if (!isOfflineCsc || target !in blockedOfflineScreens) {
            viewModel.navigateTo(target)
        }
    }

    // Restore a valid route if saved navigation state points at a cloud-only screen.
    LaunchedEffect(isOfflineCsc, currentScreen) {
        if (isOfflineCsc && currentScreen in blockedOfflineScreens) {
            viewModel.navigateTo(AppScreen.DASHBOARD)
        }
    }

    val snackbarHostState = remember { SnackbarHostState() }
    val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current

    androidx.compose.runtime.DisposableEffect(lifecycleOwner) {
        val observer = androidx.lifecycle.LifecycleEventObserver { _, event ->
            if (event == androidx.lifecycle.Lifecycle.Event.ON_STOP) {
                viewModel.onAppBackgrounded()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    LaunchedEffect(statusMessage) {
        statusMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearStatusMessage()
        }
    }

    // Comprehensive Android Back Navigation Handler
    BackHandler(enabled = currentScreen != AppScreen.DASHBOARD) {
        if (isOfflineCsc && currentScreen in blockedOfflineScreens) {
            viewModel.navigateTo(AppScreen.DASHBOARD)
        } else {
            viewModel.navigateBack()
        }
    }

    // Screens that show the root top and bottom navigation bars
    val isRootScreen = visibleScreen == AppScreen.DASHBOARD ||
            visibleScreen == AppScreen.EXAM_HUB ||
            visibleScreen == AppScreen.NOTEBOOK_SOURCES ||
            visibleScreen == AppScreen.AI_TUTOR ||
            visibleScreen == AppScreen.WEB_PORTAL

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            if (isRootScreen) {
                CertTopAppBar(
                    currentExam = currentExam,
                    isOnline = !isOfflineCsc && backendConfig.isConnected,
                    onSwitchExam = { navigateOfflineSafe(AppScreen.EXAM_SELECTOR) },
                    onOpenWebPortal = { navigateOfflineSafe(AppScreen.WEB_PORTAL) },
                    onOpenSettings = { navigateOfflineSafe(AppScreen.BACKEND_SETTINGS) },
                    onOpenProfile = { navigateOfflineSafe(AppScreen.CENTRAL_PROFILE) },
                    offlineMode = isOfflineCsc
                )
            }
        },
        bottomBar = {
            if (isRootScreen) {
                CertBottomNav(
                    currentScreen = visibleScreen,
                    onNavigate = { screen -> navigateOfflineSafe(screen) },
                    offlineMode = isOfflineCsc
                )
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            AnimatedContent(
                targetState = visibleScreen,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                label = "screen_transition"
            ) { screen ->
                when (screen) {
                    AppScreen.DASHBOARD -> DashboardScreen(viewModel = viewModel)
                    AppScreen.EXAM_HUB -> ExamsHubScreen(viewModel = viewModel)
                    AppScreen.SIMULATION_ACTIVE -> ExamSimulationScreen(viewModel = viewModel)
                    AppScreen.SESSION_RESULT -> ExamResultScreen(viewModel = viewModel)
                    AppScreen.NOTEBOOK_SOURCES -> NotebookSourcesScreen(viewModel = viewModel)
                    AppScreen.AUDIO_OVERVIEW -> AudioOverviewScreen(viewModel = viewModel)
                    AppScreen.AI_TUTOR -> AITutorScreen(viewModel = viewModel)
                    AppScreen.FLASHCARDS -> FlashcardsScreen(viewModel = viewModel)
                    AppScreen.EXAM_SELECTOR -> ExamSelectorScreen(viewModel = viewModel)
                    AppScreen.BACKEND_SETTINGS -> BackendSettingsScreen(viewModel = viewModel)
                    AppScreen.CENTRAL_PROFILE -> CentralProfileScreen(viewModel = viewModel)
                    AppScreen.WEB_PORTAL -> WebPortalScreen(viewModel = viewModel)
                }
            }
        }
    }
}
