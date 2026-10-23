@echo off
setlocal
cd /d "%~dp0"

if not exist "%~dp0venv\Scripts\python.exe" (
    echo Backend virtual environment not found.
    echo Expected: "%~dp0venv\Scripts\python.exe"
    echo Create it with: py -m venv venv
    pause
    exit /b 1
)

"%~dp0venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 8000
set "EXIT_CODE=%ERRORLEVEL%"

if not "%EXIT_CODE%"=="0" (
    echo.
    echo Backend stopped with exit code %EXIT_CODE%.
    pause
)

exit /b %EXIT_CODE%