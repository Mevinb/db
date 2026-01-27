@echo off
echo ========================================
echo   College Management System - Restart
echo ========================================
echo.

echo [1/3] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo       Done!
echo.

echo [2/3] Starting Backend Server (Port 5000)...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo       Done!
echo.

echo [3/3] Starting Frontend (Vite Dev Server)...
cd /d "%~dp0"
start "Frontend" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul
echo       Done!
echo.

echo ========================================
echo   Both servers are starting!
echo.
echo   Backend:  http://localhost:5000/api
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
