@echo off
REM Kp-Music Bot - Production Launcher for Windows
REM Enhanced version with error checking and configuration validation

setlocal enabledelayedexpansion

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  color 0c
  echo.
  echo ^^!^^! ERROR: Node.js not found
  echo.
  echo Download Node.js from: https://nodejs.org
  echo Required: Node.js 18 or higher
  echo.
  pause
  exit /b 1
)

REM Display boot information
color 0a
echo.
echo =====================================
echo   Kp-Music Bot v4.1.0 - Production
echo =====================================
echo.

REM Check for .env file
if not exist ".env" (
  color 0e
  echo [!] .env file not found
  echo.
  echo Copying .env.example to .env...
  copy .env.example .env >nul
  echo.
  echo [!] Please edit .env with your credentials
  echo [!] Where to get credentials:
  echo    - Discord Token: https://discord.com/developers/applications
  echo    - YouTube API: https://console.cloud.google.com
  echo    - Spotify Credentials: https://developer.spotify.com/dashboard
  echo.
  echo [!] Once configured, run this script again
  pause
  exit /b 1
)

REM Launch the bot
color 0b
echo [✓] Launching Kp-Music Bot...
echo [✓] Suppressing warnings at 5 levels
echo.
node launcher.js

REM Error handling
if %ERRORLEVEL% NEQ 0 (
  color 0c
  echo.
  echo [✗] Bot terminated with error code: %ERRORLEVEL%
  echo.
  pause
  exit /b 1
)
