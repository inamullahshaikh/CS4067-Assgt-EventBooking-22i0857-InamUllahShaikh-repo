@echo off
echo Freeing up ports and starting all services...

:: Function to kill process on a specific port
setlocal
set "ports=8000 5000 5001 5002 3000"

for %%p in (%ports%) do (
    echo Killing process on port %%p...
    netstat -ano | findstr :%%p >nul
    if %errorlevel%==0 (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p') do (
            taskkill /PID %%a /F >nul 2>&1
            echo Process on port %%p killed.
        )
    ) else (
        echo No process found on port %%p.
    )
)

:: Start User Service (FastAPI) on port 8000
start cmd /k "cd /d %~dp0\src\user-services && uvicorn main:app --host 127.0.0.1 --port 8000"

:: Start Event Service (Express.js) on port 5000
start cmd /k "cd /d %~dp0\src\event-services && node server.js"

:: Start Booking Service (Express.js) on port 5001
start cmd /k "cd /d %~dp0\src\booking-services && node book.js"

:: Start Notification Service (Express.js) on port 5002
start cmd /k "cd /d %~dp0\src\notifications-services && node noti.js"

:: Start Frontend (front.js)
:: start cmd /k "cd /d %~dp0 && node front.js"

:: Wait a few seconds to let services start
timeout /t 5

echo All services started!
