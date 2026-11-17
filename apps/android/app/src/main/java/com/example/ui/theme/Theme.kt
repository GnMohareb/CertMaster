package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = AccentBlueLight,
    onPrimary = Slate900,
    primaryContainer = Color(0xFF1E3A8A),
    onPrimaryContainer = Color(0xFFDBEAFE),
    secondary = AccentCyan,
    onSecondary = Slate900,
    secondaryContainer = Color(0xFF0E7490),
    onSecondaryContainer = Color(0xFFCFFAFE),
    tertiary = GoldMastery,
    onTertiary = Slate900,
    background = Color(0xFF0B1120),
    surface = Color(0xFF131D31),
    surfaceVariant = Color(0xFF1E293B),
    onBackground = Slate100,
    onSurface = Slate100,
    onSurfaceVariant = Slate400,
    error = ErrorRed,
    errorContainer = Color(0xFF7F1D1D),
    onError = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = AccentBlue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFDBEAFE),
    onPrimaryContainer = Color(0xFF1E3A8A),
    secondary = Color(0xFF0284C7),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE0F2FE),
    onSecondaryContainer = Color(0xFF075985),
    tertiary = WarningAmber,
    onTertiary = Color.White,
    background = Color(0xFFF8FAFC),
    surface = Color.White,
    surfaceVariant = Color(0xFFF1F5F9),
    onBackground = Slate900,
    onSurface = Slate900,
    onSurfaceVariant = Slate600,
    error = ErrorRed,
    errorContainer = ErrorRedContainer,
    onError = Color.White
)

private val CscLightColorScheme = lightColorScheme(
    primary = CscPrimaryBlue,
    onPrimary = Color.White,
    primaryContainer = CscSelectedBg,
    onPrimaryContainer = CscPrimaryBlue,
    secondary = CscPrimaryBlue,
    onSecondary = Color.White,
    secondaryContainer = CscCreamSecondary,
    onSecondaryContainer = CscTextPrimary,
    tertiary = CscWarningDark,
    onTertiary = Color.White,
    background = CscWarmBackground,
    onBackground = CscTextPrimary,
    surface = CscCardSurface,
    onSurface = CscTextPrimary,
    surfaceVariant = CscCreamSecondary,
    onSurfaceVariant = CscTextSecondary,
    outline = CscPrimaryBlue,
    outlineVariant = CscBorder,
    error = CscErrorDark,
    errorContainer = CscErrorBg,
    onError = Color.White,
    onErrorContainer = CscErrorDark
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Set false to preserve our custom high-fidelity brand colors
    forceWarmLight: Boolean = com.example.BuildConfig.TARGET_EXAM_ID.startsWith("csc-part-"),
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        forceWarmLight -> CscLightColorScheme
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

