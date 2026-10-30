package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.SimulationScoreEntity
import com.example.model.ExamConfig
import com.example.ui.theme.AccentBlue
import com.example.ui.theme.AccentCyan
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.GoldMastery
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.WarningAmber
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun PerformanceLineChart(
    scores: List<SimulationScoreEntity>,
    currentExam: ExamConfig,
    modifier: Modifier = Modifier
) {
    if (scores.isEmpty()) {
        Card(
            modifier = modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.TrendingUp,
                    contentDescription = null,
                    modifier = Modifier.size(40.dp),
                    tint = Slate400
                )
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "No Simulation Score History Yet",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Complete practice exam simulations to record trends across subject domains into Room SQLite.",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    lineHeight = 16.sp
                )
            }
        }
        return
    }

    // Selected Domain filter: null = Overall Simulation Score, or domainId string
    var selectedDomainId by remember { mutableStateOf<String?>(null) }
    // Interactive scrubbed attempt index
    var selectedPointIndex by remember(scores.size) { mutableIntStateOf(scores.lastIndex) }

    val passBenchmark = currentExam.passingScorePercent
    val primaryChartColor = Color(currentExam.primaryColorHex)

    // Calculate score progression metrics
    val firstScore = scores.first().overallScorePercent
    val latestScore = scores.last().overallScorePercent
    val scoreDelta = latestScore - firstScore
    val bestScore = scores.maxOf { it.overallScorePercent }
    val avgScore = scores.map { it.overallScorePercent }.average().toInt()

    val domainColors = remember {
        listOf(
            AccentBlue,
            AccentCyan,
            GoldMastery,
            SuccessGreen,
            WarningAmber,
            Color(0xFFAB47BC), // Purple
            Color(0xFF26A69A), // Teal
            Color(0xFFFF7043)  // Orange
        )
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("performance_line_chart_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Header: Title & Velocity Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.TrendingUp,
                            contentDescription = null,
                            tint = primaryChartColor,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Simulation Score Trajectory",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 15.sp,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Text(
                        text = "Persisted in Room SQLite • ${scores.size} Exam Attempts Recorded",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Score Velocity Badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (scoreDelta >= 0) SuccessGreen.copy(alpha = 0.15f) else ErrorRed.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = if (scoreDelta >= 0) "+$scoreDelta% gain" else "$scoreDelta%",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (scoreDelta >= 0) SuccessGreen else ErrorRed
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Quick Stats Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                MetricSummaryPill(label = "Latest Attempt", value = "$latestScore%", isPass = latestScore >= passBenchmark, modifier = Modifier.weight(1f))
                MetricSummaryPill(label = "Target Pass", value = "$passBenchmark%", isPass = null, modifier = Modifier.weight(1f))
                MetricSummaryPill(label = "Best Score", value = "$bestScore%", isPass = bestScore >= passBenchmark, modifier = Modifier.weight(1f))
                MetricSummaryPill(label = "Average", value = "$avgScore%", isPass = avgScore >= passBenchmark, modifier = Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Domain Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                FilterChip(
                    selected = selectedDomainId == null,
                    onClick = { selectedDomainId = null },
                    label = { Text("Overall Exam", fontSize = 11.sp, fontWeight = FontWeight.SemiBold) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = primaryChartColor.copy(alpha = 0.18f),
                        selectedLabelColor = primaryChartColor
                    )
                )

                currentExam.domains.forEachIndexed { index, domain ->
                    val color = domainColors.getOrElse(index) { AccentBlue }
                    FilterChip(
                        selected = selectedDomainId == domain.id,
                        onClick = { selectedDomainId = domain.id },
                        label = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(color)
                                )
                                Spacer(modifier = Modifier.width(5.dp))
                                Text("D${domain.number}: ${domain.title.take(18)}…", fontSize = 11.sp)
                            }
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = color.copy(alpha = 0.18f),
                            selectedLabelColor = color
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // CANVAS LINE CHART
            val activeColor = if (selectedDomainId == null) {
                primaryChartColor
            } else {
                val dIdx = currentExam.domains.indexOfFirst { it.id == selectedDomainId }
                domainColors.getOrElse(if (dIdx >= 0) dIdx else 0) { primaryChartColor }
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f))
                    .pointerInput(scores) {
                        detectTapGestures { offset ->
                            val width = size.width
                            val paddingLeft = 40.dp.toPx()
                            val paddingRight = 20.dp.toPx()
                            val plotWidth = width - paddingLeft - paddingRight
                            val count = scores.size
                            if (count > 1) {
                                val xRel = (offset.x - paddingLeft).coerceIn(0f, plotWidth)
                                val step = plotWidth / (count - 1)
                                val nearestIndex = (xRel / step + 0.5f).toInt().coerceIn(0, count - 1)
                                selectedPointIndex = nearestIndex
                            } else {
                                selectedPointIndex = 0
                            }
                        }
                    }
                    .pointerInput(scores) {
                        detectDragGestures { change, _ ->
                            val width = size.width
                            val paddingLeft = 40.dp.toPx()
                            val paddingRight = 20.dp.toPx()
                            val plotWidth = width - paddingLeft - paddingRight
                            val count = scores.size
                            if (count > 1) {
                                val xRel = (change.position.x - paddingLeft).coerceIn(0f, plotWidth)
                                val step = plotWidth / (count - 1)
                                val nearestIndex = (xRel / step + 0.5f).toInt().coerceIn(0, count - 1)
                                selectedPointIndex = nearestIndex
                            }
                        }
                    }
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height
                    val padLeft = 40.dp.toPx()
                    val padRight = 20.dp.toPx()
                    val padTop = 20.dp.toPx()
                    val padBottom = 30.dp.toPx()

                    val chartW = w - padLeft - padRight
                    val chartH = h - padTop - padBottom

                    // Draw Horizontal Grid Lines (0%, 25%, 50%, 75%, 100%)
                    val gridSteps = listOf(0.25f, 0.50f, 0.75f, 1.0f)
                    gridSteps.forEach { stepVal ->
                        val y = padTop + chartH * (1f - stepVal)
                        drawLine(
                            color = Color.LightGray.copy(alpha = 0.3f),
                            start = Offset(padLeft, y),
                            end = Offset(w - padRight, y),
                            strokeWidth = 1.dp.toPx()
                        )
                    }

                    // Draw Passing Benchmark Dashed Line
                    val passFraction = passBenchmark / 100f
                    val passY = padTop + chartH * (1f - passFraction)
                    val dashedEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f), 0f)
                    drawLine(
                        color = WarningAmber.copy(alpha = 0.85f),
                        start = Offset(padLeft, passY),
                        end = Offset(w - padRight, passY),
                        strokeWidth = 1.5.dp.toPx(),
                        pathEffect = dashedEffect
                    )

                    // Map Score points
                    val dataPoints = scores.mapIndexed { idx, s ->
                        val scoreVal = if (selectedDomainId == null) {
                            s.overallScorePercent
                        } else {
                            val ds = s.parseDomainScores().firstOrNull { it.domainId == selectedDomainId }
                            ds?.scorePercent ?: s.overallScorePercent
                        }

                        val x = if (scores.size > 1) {
                            padLeft + (chartW / (scores.size - 1)) * idx
                        } else {
                            padLeft + chartW / 2
                        }
                        val y = padTop + chartH * (1f - (scoreVal / 100f).coerceIn(0f, 1f))
                        Offset(x, y)
                    }

                    // Build Curve Path & Fill Path
                    if (dataPoints.isNotEmpty()) {
                        val strokePath = Path().apply {
                            moveTo(dataPoints.first().x, dataPoints.first().y)
                            for (i in 1 until dataPoints.size) {
                                val prev = dataPoints[i - 1]
                                val cur = dataPoints[i]
                                val cx = (prev.x + cur.x) / 2
                                cubicTo(cx, prev.y, cx, cur.y, cur.x, cur.y)
                            }
                        }

                        val fillPath = Path().apply {
                            addPath(strokePath)
                            lineTo(dataPoints.last().x, padTop + chartH)
                            lineTo(dataPoints.first().x, padTop + chartH)
                            close()
                        }

                        // Gradient Area Fill
                        drawPath(
                            path = fillPath,
                            brush = Brush.verticalGradient(
                                colors = listOf(activeColor.copy(alpha = 0.30f), activeColor.copy(alpha = 0.02f)),
                                startY = padTop,
                                endY = padTop + chartH
                            )
                        )

                        // Main Stroke Line
                        drawPath(
                            path = strokePath,
                            color = activeColor,
                            style = Stroke(
                                width = 3.dp.toPx(),
                                cap = StrokeCap.Round,
                                join = StrokeJoin.Round
                            )
                        )

                        // Draw Point Nodes
                        dataPoints.forEachIndexed { i, pt ->
                            val isSelected = i == selectedPointIndex
                            val ptScore = if (selectedDomainId == null) {
                                scores[i].overallScorePercent
                            } else {
                                scores[i].parseDomainScores().firstOrNull { it.domainId == selectedDomainId }?.scorePercent ?: scores[i].overallScorePercent
                            }
                            val isPassing = ptScore >= passBenchmark

                            val nodeColor = if (isPassing) SuccessGreen else if (ptScore >= 60) WarningAmber else ErrorRed
                            val radius = if (isSelected) 6.dp.toPx() else 4.dp.toPx()

                            // Outer shadow/halo if selected
                            if (isSelected) {
                                drawCircle(
                                    color = activeColor.copy(alpha = 0.35f),
                                    radius = radius + 5.dp.toPx(),
                                    center = pt
                                )
                                // Vertical scrub hairline
                                drawLine(
                                    color = activeColor.copy(alpha = 0.7f),
                                    start = Offset(pt.x, padTop),
                                    end = Offset(pt.x, padTop + chartH),
                                    strokeWidth = 1.dp.toPx(),
                                    pathEffect = dashedEffect
                                )
                            }

                            drawCircle(
                                color = nodeColor,
                                radius = radius,
                                center = pt
                            )
                            drawCircle(
                                color = Color.White,
                                radius = radius * 0.45f,
                                center = pt
                            )
                        }
                    }
                }

                // Benchmark Label
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(top = 6.dp, end = 12.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(WarningAmber.copy(alpha = 0.15f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "PASS: $passBenchmark%",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = WarningAmber
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // X-Axis Attempt Selector Footnote
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Attempt 1 (${formatDate(scores.first().timestampMillis)})",
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "Tap any node to inspect telemetry",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = activeColor
                )
                Text(
                    text = "Attempt ${scores.size} (${formatDate(scores.last().timestampMillis)})",
                    fontSize = 10.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // SCRUBBED ATTEMPT INSPECTION CARD
            if (selectedPointIndex in scores.indices) {
                val selectedScore = scores[selectedPointIndex]
                val domainRecords = selectedScore.parseDomainScores()

                Spacer(modifier = Modifier.height(14.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(activeColor.copy(alpha = 0.4f))
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .clip(CircleShape)
                                        .background(if (selectedScore.isPassed) SuccessGreen else ErrorRed),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "#${selectedScore.attemptNumber}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = "Attempt #${selectedScore.attemptNumber} Details",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    )
                                    Text(
                                        text = formatDateTime(selectedScore.timestampMillis),
                                        fontSize = 10.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "${selectedScore.overallScorePercent}%",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = if (selectedScore.isPassed) SuccessGreen else ErrorRed
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (selectedScore.isPassed) SuccessGreen.copy(alpha = 0.15f) else ErrorRed.copy(alpha = 0.15f))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = if (selectedScore.isPassed) "PASS" else "FAILED",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (selectedScore.isPassed) SuccessGreen else ErrorRed
                                    )
                                }
                            }
                        }

                        // Domain breakdown for this selected attempt
                        if (domainRecords.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "Domain Performance Breakdown:",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(6.dp))

                            domainRecords.chunked(2).forEach { rowDomains ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    rowDomains.forEach { dRecord ->
                                        val isPassing = dRecord.scorePercent >= passBenchmark
                                        Box(
                                            modifier = Modifier
                                                .weight(1f)
                                                .clip(RoundedCornerShape(8.dp))
                                                .background(MaterialTheme.colorScheme.surface)
                                                .padding(horizontal = 8.dp, vertical = 6.dp)
                                        ) {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(
                                                    text = dRecord.domainName,
                                                    fontSize = 10.sp,
                                                    color = MaterialTheme.colorScheme.onSurface,
                                                    maxLines = 1,
                                                    modifier = Modifier.weight(1f)
                                                )
                                                Text(
                                                    text = "${dRecord.scorePercent}%",
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = if (isPassing) SuccessGreen else WarningAmber
                                                )
                                            }
                                        }
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricSummaryPill(
    label: String,
    value: String,
    isPass: Boolean?,
    modifier: Modifier = Modifier
) {
    val textColor = when (isPass) {
        true -> SuccessGreen
        false -> ErrorRed
        null -> MaterialTheme.colorScheme.onSurface
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
            .padding(vertical = 8.dp, horizontal = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1)
            Text(value, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = textColor)
        }
    }
}

private fun formatDate(millis: Long): String {
    val sdf = SimpleDateFormat("MMM d", Locale.getDefault())
    return sdf.format(Date(millis))
}

private fun formatDateTime(millis: Long): String {
    val sdf = SimpleDateFormat("MMM d, yyyy • h:mm a", Locale.getDefault())
    return sdf.format(Date(millis))
}
