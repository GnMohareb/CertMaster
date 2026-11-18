#!/usr/bin/env bash
set -euo pipefail

mkdir -p qa-artifacts

APK_PATH=$(find apps/android/app/build/outputs/apk/cscPart1/debug -name '*.apk' -print -quit)
test -n "$APK_PATH"
AAPT="$ANDROID_HOME/build-tools/36.0.0/aapt"
LAUNCH_ACTIVITY=$("$AAPT" dump badging "$APK_PATH" | sed -n "s/^launchable-activity: name='\([^']*\)'.*/\1/p" | head -n1)
test -n "$LAUNCH_ACTIVITY"
echo "Resolved launchable activity: $LAUNCH_ACTIVITY"

adb wait-for-device
adb shell cmd uimode night no || true
adb shell svc wifi disable || true
adb shell svc data disable || true
adb shell settings put global airplane_mode_on 1 || true
adb shell am broadcast -a android.intent.action.AIRPLANE_MODE --ez state true >/dev/null 2>&1 || true

adb uninstall com.certmaster.cscpart1 >/dev/null 2>&1 || true
adb install -r "$APK_PATH"

adb shell dumpsys package com.certmaster.cscpart1 | grep -E "Package \[|versionCode|versionName|firstInstallTime|lastUpdateTime" > qa-artifacts/package-version.txt || true
cat qa-artifacts/package-version.txt

# Capture System Light mode launch dashboard
adb shell am force-stop com.certmaster.cscpart1
adb shell am start -W -n "com.certmaster.cscpart1/${LAUNCH_ACTIVITY}"
sleep 5
adb exec-out screencap -p > qa-artifacts/dashboard-light.png
adb shell uiautomator dump /sdcard/window_dump_light.xml || (sleep 2 && adb shell uiautomator dump --compressed /sdcard/window_dump_light.xml)
adb pull /sdcard/window_dump_light.xml qa-artifacts/dashboard-light-hierarchy.xml

# Switch to System Dark mode and verify warm-light override
adb shell cmd uimode night yes
sleep 2
adb shell am force-stop com.certmaster.cscpart1
adb shell am start -W -n "com.certmaster.cscpart1/${LAUNCH_ACTIVITY}"
sleep 5
adb exec-out screencap -p > qa-artifacts/dashboard-system-dark.png
adb shell uiautomator dump /sdcard/window_dump_dark.xml || (sleep 2 && adb shell uiautomator dump --compressed /sdcard/window_dump_dark.xml)
adb pull /sdcard/window_dump_dark.xml qa-artifacts/dashboard-dark-hierarchy.xml

adb logcat -d -t 500 > qa-artifacts/logcat.txt || true

python3 - <<'PY' > qa-artifacts/pixel-summary.txt
import collections, struct, zlib

def sample_png(path):
    with open(path, 'rb') as f:
        data = f.read()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', f'{path}: invalid PNG'
    pos = 8
    w = h = bit_depth = color_type = 0
    idat = bytearray()
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        ctype = data[pos+4:pos+8]
        chunk = data[pos+8:pos+8+length]
        pos += 12 + length
        if ctype == b'IHDR':
            w, h, bit_depth, color_type = struct.unpack('>IIBB', chunk[:10])
        elif ctype == b'IDAT':
            idat.extend(chunk)
        elif ctype == b'IEND':
            break
    assert bit_depth == 8 and color_type in (2, 6), f'Unsupported PNG format: depth={bit_depth}, type={color_type}'
    bpp = 3 if color_type == 2 else 4
    raw = zlib.decompress(bytes(idat))
    stride = w * bpp
    prev = bytearray(stride)
    counts = collections.Counter()
    step_y = max(1, h // 120)
    step_x = max(1, w // 60)
    idx = 0
    for y in range(h):
        ftype = raw[idx]; idx += 1
        row = bytearray(raw[idx:idx+stride]); idx += stride
        if ftype == 1:
            for i in range(bpp, stride):
                row[i] = (row[i] + row[i - bpp]) & 0xFF
        elif ftype == 2:
            for i in range(stride):
                row[i] = (row[i] + prev[i]) & 0xFF
        elif ftype == 3:
            for i in range(stride):
                a = row[i - bpp] if i >= bpp else 0
                row[i] = (row[i] + ((a + prev[i]) >> 1)) & 0xFF
        elif ftype == 4:
            for i in range(stride):
                a = row[i - bpp] if i >= bpp else 0
                b = prev[i]
                c = prev[i - bpp] if i >= bpp else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                row[i] = (row[i] + pr) & 0xFF
        prev = row
        if y % step_y == 0 and int(h * 0.05) <= y <= int(h * 0.94):
            for x in range(0, w, step_x):
                off = x * bpp
                r, g, b = row[off], row[off+1], row[off+2]
                counts[f'#{r:02X}{g:02X}{b:02X}'] += 1
    total = sum(counts.values()) or 1
    print(f'=== {path} ({w}x{h}, {len(data)} bytes) ===')
    for hex_c, n in counts.most_common(12):
        print(f'  {hex_c}: {n * 100.0 / total:.2f}%')

    assert counts['#5B4636'] > 0, f'{path}: missing warm action accent'
    assert counts['#365D85'] == 0, f'{path}: old blue action accent is still visible'

sample_png('qa-artifacts/dashboard-light.png')
sample_png('qa-artifacts/dashboard-system-dark.png')
PY
cat qa-artifacts/pixel-summary.txt

echo "CSC_DASHBOARD_PNG_BEGIN"
base64 -w 120 qa-artifacts/dashboard-light.png
echo "CSC_DASHBOARD_PNG_END"
