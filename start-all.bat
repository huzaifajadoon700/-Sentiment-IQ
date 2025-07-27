@echo off
echo ========================================
echo   Starting Sentiment Analysis Web App
echo ========================================
echo.

echo 🚀 Starting all services...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Install dependencies if needed
echo 📦 Installing dependencies...

echo Installing backend dependencies...
cd backend
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
)
cd ..

echo Installing frontend dependencies...
cd frontend
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
cd ..

echo Installing ML service dependencies...
cd ml-service
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Some ML dependencies might not be installed correctly
)
cd ..

echo.
echo ✅ Dependencies installed successfully
echo.

echo 🤖 Starting ML Service (Python)...
start "ML Service" cmd /k "cd ml-service && python app.py"
timeout /t 3 /nobreak >nul

echo 🚀 Starting Backend (Node.js)...
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo 📱 Starting Frontend (React)...
start "Frontend" cmd /k "cd frontend && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   🎉 All services are starting up!
echo ========================================
echo.
echo Services will be available at:
echo   📱 Frontend:  http://localhost:3000
echo   🚀 Backend:   http://localhost:5000
echo   🤖 ML Service: http://localhost:8000
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:3000

echo.
echo 💡 To stop all services, close the terminal windows
echo    or press Ctrl+C in each terminal
echo.
pause
