package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
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
        enableEdgeToEdge()
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

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(statusMessage) {
        statusMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearStatusMessage()
        }
    }

    // Screens that show the root top and bottom navigation bars
    val isRootScreen = currentScreen == AppScreen.DASHBOARD ||
            currentScreen == AppScreen.EXAM_HUB ||
            currentScreen == AppScreen.NOTEBOOK_SOURCES ||
            currentScreen == AppScreen.AI_TUTOR ||
            currentScreen == AppScreen.WEB_PORTAL

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            if (isRootScreen) {
                CertTopAppBar(
                    currentExam = currentExam,
                    isOnline = backendConfig.isConnected,
                    onSwitchExam = { viewModel.navigateTo(AppScreen.EXAM_SELECTOR) },
                    onOpenWebPortal = { viewModel.navigateTo(AppScreen.WEB_PORTAL) },
                    onOpenSettings = { viewModel.navigateTo(AppScreen.BACKEND_SETTINGS) },
                    onOpenProfile = { viewModel.navigateTo(AppScreen.CENTRAL_PROFILE) }
                )
            }
        },
        bottomBar = {
            if (isRootScreen) {
                CertBottomNav(
                    currentScreen = currentScreen,
                    onNavigate = { screen -> viewModel.navigateTo(screen) }
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
                targetState = currentScreen,
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
