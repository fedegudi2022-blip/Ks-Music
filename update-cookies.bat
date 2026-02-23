@echo off
REM ═══════════════════════════════════════════════════════════════════════════
REM  🍪 KP-MUSIC - YouTube Cookies Helper
REM ═══════════════════════════════════════════════════════════════════════════

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║      KP-MUSIC YOUTUBE COOKIES - Actualizar en Windows                ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.
echo.

REM Check if cookies.txt exists and show current status
if exist "cookies.txt" (
    echo ✓ Archivo cookies.txt encontrado
    echo.
    for /f %%i in ("cookies.txt") do set size=%%~zi
    echo   Tamaño: !size! bytes
    echo.
) else (
    echo ✗ No existe cookies.txt - se creará uno vacío
    echo.
)

echo.
echo ══════════════════════════════════════════════════════════════════════════
echo   OPCIÓN 1: Exportar desde Chrome/Edge (RECOMENDADO)
echo ══════════════════════════════════════════════════════════════════════════
echo.
echo   Pasos:
echo   1. Abre Microsoft Edge (o Chrome si lo tienes)
echo   2. Ve a https://youtube.com y LOGIN en tu cuenta
echo   3. Instala la extensión "Get cookies.txt":
echo      https://microsoftedge.microsoft.com/addons/detail/get-cookiestxt/jffbegmjkchnapijdeppfbpoghelphlg
echo   4. Haz clic en la extensión → "Export"
echo   5. Abre este archivo en Bloc de notas:
echo      %CD%\cookies.txt
echo   6. Pega el contenido de la extensión (Ctrl+V)
echo   7. Guarda (Ctrl+S)
echo   8. Reinicia el bot
echo.
echo ══════════════════════════════════════════════════════════════════════════
echo   OPCIÓN 2: Intentar extraer automáticamente
echo ══════════════════════════════════════════════════════════════════════════
echo.
set /p choice="¿Quieres intentar extraer cookies de Edge automáticamente? (s/n): "
if /i "%choice%"=="s" (
    echo.
    echo ⏳ Intentando extraer cookies de Edge...
    echo.
    yt-dlp --cookies-from-browser edge --cookies cookies.txt "https://www.youtube.com" 2>&1
    if !errorlevel! equ 0 (
        echo.
        echo ✅ ¡Éxito! Las cookies se han actualizado
        echo    El bot debería funcionar ahora
    ) else (
        echo.
        echo ⚠️  La extracción automática falló
        echo    Usa la OPCIÓN 1 con la extensión (es más confiable)
    )
)

echo.
echo ══════════════════════════════════════════════════════════════════════════
echo   PRUEBA RÁPIDA
echo ══════════════════════════════════════════════════════════════════════════
echo.
set /p testChoice="¿Verificar si las cookies funcionan? (s/n): "
if /i "%testChoice%"=="s" (
    echo.
    echo 🧪 Probando con un video público...
    echo.
    yt-dlp --cookies cookies.txt "https://www.youtube.com/watch?v=jNQXAC9IVRw" --get-title --quiet 2>&1
    if !errorlevel! equ 0 (
        echo.
        echo ✅ ¡Las cookies funcionan correctamente!
    ) else (
        echo.
        echo ❌ Las cookies aún no funcionan - sigue la OPCIÓN 1
    )
)

echo.
echo.
pause
