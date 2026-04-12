@echo off
cd /d C:\Users\harshitmago\Documents\code\ml4

:: Kill any existing server on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 1 /nobreak >nul
start http://localhost:8000
python -m http.server 8000
