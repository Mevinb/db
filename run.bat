@echo off
title College Management System - Launcher
echo ============================================
echo   College Management System - Starting...
echo ============================================
echo.

:: Kill any existing Node processes on ports 5000 and 3000
echo [1/3] Stopping existing servers...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo    Done.
echo.

:: Start Backend
echo [2/3] Starting Backend (port 5000)...
cd /d "%~dp0backend"
start "CMS-Backend" cmd /k "title CMS Backend & node server.js"
echo    Backend starting...
echo.

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend
echo [3/3] Starting Frontend (port 3000)...
cd /d "%~dp0frontend"
start "CMS-Frontend" cmd /k "title CMS Frontend & npx next dev"
echo    Frontend starting...
echo.

echo ============================================
echo   Both servers are launching!
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ============================================
echo.
echo Close this window anytime. The servers
echo will keep running in their own windows.
echo.
pause
