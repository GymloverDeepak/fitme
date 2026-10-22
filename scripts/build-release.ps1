# Builds a signed FITME production APK and verifies it.
# Usage (from the project root, in PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts\build-release.ps1
# Options: -SkipChecks (skip lint/tests), -Abis "arm64-v8a,armeabi-v7a" (CPU types to include)
#
# Signing: keystore path/alias come from %USERPROFILE%\.gradle\gradle.properties
# (FITME_UPLOAD_STORE_FILE, FITME_UPLOAD_KEY_ALIAS). The password is read from
# %USERPROFILE%\.fitme-signing\fitme-release-password.txt if present, otherwise you are asked for it.
# The password is only passed to Gradle through an environment variable and is never printed.
param([switch]$SkipChecks, [string]$Abis = 'arm64-v8a,armeabi-v7a')
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

function Step($text) { Write-Host "`n=== $text ===" -ForegroundColor Green }
function Fail($text) { Write-Host "BUILD STOPPED: $text" -ForegroundColor Red; exit 1 }

if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) { Fail 'JAVA_HOME must point to a JDK 17 folder.' }
if (-not $env:ANDROID_HOME -or -not (Test-Path $env:ANDROID_HOME)) { Fail 'ANDROID_HOME must point to your Android SDK.' }

# ---------- Signing password ----------
$passwordFile = Join-Path $env:USERPROFILE '.fitme-signing\fitme-release-password.txt'
if (Test-Path $passwordFile) {
  $password = (Get-Content $passwordFile -Raw).Trim()
} else {
  $secure = Read-Host 'FITME release keystore password' -AsSecureString
  $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}
if (-not $password) { Fail 'No keystore password available.' }

$app = (Get-Content app.json -Raw | ConvertFrom-Json).expo
Write-Host "FITME $($app.version) (versionCode $($app.android.versionCode)) - package $($app.android.package)"

# ---------- Checks ----------
if (-not $SkipChecks) {
  Step 'Lint'; npx expo lint; if ($LASTEXITCODE -ne 0) { Fail 'lint failed' }
  Step 'Logic checks'; npm run check; if ($LASTEXITCODE -ne 0) { Fail 'checks failed' }
  Step 'Expo doctor'; npx expo-doctor; if ($LASTEXITCODE -ne 0) { Fail 'expo-doctor reported problems' }
}

# ---------- Regenerate native project ----------
Step 'Prebuild (regenerates android/)'
$packageJson = Join-Path $root 'package.json'
$packageBefore = [System.IO.File]::ReadAllText($packageJson)
npx expo prebuild --platform android --clean --no-install
if ($LASTEXITCODE -ne 0) { Fail 'prebuild failed' }
# prebuild rewrites the "android"/"ios" scripts to expo run:*; restore the original file exactly (no BOM).
[System.IO.File]::WriteAllText($packageJson, $packageBefore, (New-Object System.Text.UTF8Encoding $false))

# Windows: long-path-capable CMake (see README "Windows one-time setup").
$sdk = $env:ANDROID_HOME -replace '\\', '/'
$cmake = Get-ChildItem "$env:ANDROID_HOME\cmake" -Directory | Where-Object { $_.Name -like '3.31*' -or $_.Name -like '4.*' } | Sort-Object Name | Select-Object -Last 1
$lines = @("sdk.dir=$($sdk -replace ':', '\:')")
if ($cmake) { $lines += "cmake.dir=$(($cmake.FullName -replace '\\', '/') -replace ':', '\:')" } else { Write-Host 'WARNING: CMake 3.31+ not found; the C++ build may fail on long Windows paths.' -ForegroundColor Yellow }
Set-Content -Path android\local.properties -Value $lines -Encoding ascii

if (-not (Select-String -Path android\app\build.gradle -Pattern 'FITME release signing' -Quiet)) { Fail 'release signing plugin was not applied to android/app/build.gradle' }

# ---------- Build ----------
Step "Gradle assembleRelease ($Abis) - this can take 10-30 minutes"
$env:FITME_UPLOAD_STORE_PASSWORD = $password
$env:FITME_UPLOAD_KEY_PASSWORD = $password
try {
  Push-Location android
  .\gradlew.bat assembleRelease --no-daemon --console=plain "-PreactNativeArchitectures=$Abis"
  $gradleExit = $LASTEXITCODE
  Pop-Location
} finally {
  Remove-Item Env:FITME_UPLOAD_STORE_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:FITME_UPLOAD_KEY_PASSWORD -ErrorAction SilentlyContinue
  $password = $null
}
if ($gradleExit -ne 0) { Fail "Gradle failed (exit $gradleExit)" }

# ---------- Verify ----------
Step 'Verify APK'
$apk = 'android\app\build\outputs\apk\release\app-release.apk'
if (-not (Test-Path $apk)) { Fail "APK not found at $apk" }
$apksigner = Get-ChildItem "$env:ANDROID_HOME\build-tools\*\apksigner.bat" | Sort-Object FullName | Select-Object -Last 1
$aapt = Get-ChildItem "$env:ANDROID_HOME\build-tools\*\aapt2.exe" | Sort-Object FullName | Select-Object -Last 1
$signature = & $apksigner.FullName verify --print-certs --verbose $apk 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) { Fail "apksigner verification failed:`n$signature" }
if ($signature -match 'CN=Android Debug') { Fail 'APK is signed with the DEBUG key - not a production build.' }
$badging = & $aapt.FullName dump badging $apk 2>$null | Out-String

New-Item -ItemType Directory -Force release | Out-Null
$output = "release\FITME-v$($app.version).apk"
Copy-Item $apk $output -Force
$file = Get-Item $output
$hash = (Get-FileHash $output -Algorithm SHA256).Hash

Write-Host "`nSIGNED RELEASE APK READY" -ForegroundColor Green
Write-Host "File:     $($file.FullName)"
Write-Host ("Size:     {0:N1} MB ({1:N0} bytes)" -f ($file.Length / 1MB), $file.Length)
Write-Host "SHA-256:  $hash"
($badging -split "`r?`n") | Where-Object { $_ -match "^package:|^application-label:|^uses-permission:|^native-code:|^sdkVersion|^targetSdkVersion" } | ForEach-Object { Write-Host "          $_" }
($signature -split "`r?`n") | Where-Object { $_ -match 'Verified using v[1-3] |certificate DN|certificate SHA-256' } | ForEach-Object { Write-Host "          $_" }
