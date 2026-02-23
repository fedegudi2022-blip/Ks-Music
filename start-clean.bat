@echo off
REM Script para ejecutar KP-Music Bot sin warnings
REM Este script elimina todos los warnings innecesarios

setlocal enabledelayedexpansion

REM Opción 1: Ejecución limpia (recomendada)
echo Iniciando Kp-Music Bot...
echo.
node --no-warnings src/index.js %*

REM Notas:
REM - El flag --no-warnings suprime warnings de Node.js
REM - patch-setTimeout.js suprime TimeoutNegativeWarning a nivel de app
REM - Combinados = Bot completamente limpio
