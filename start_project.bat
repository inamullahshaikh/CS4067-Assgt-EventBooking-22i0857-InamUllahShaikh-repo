@echo off
start "" run.bat
timeout /t 3 /nobreak >nul
start "" python -m http.server 5500
timeout /t 2 /nobreak >nul
start chrome "http://localhost:5500/src/frontend/index.html"
