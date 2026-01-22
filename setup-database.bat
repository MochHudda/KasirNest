@echo off
REM KasirNest Database Setup Script for Windows
REM This script sets up the MySQL database for KasirNest application

echo 🗄️  Setting up KasirNest MySQL Database...
echo ========================================

REM Check if MySQL is available
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL is not installed or not in PATH
    pause
    exit /b 1
)

REM Load environment variables
if exist .env (
    echo 📋 Loading configuration from .env file...
    for /f "usebackq tokens=1,2 delims==" %%a in (.env) do (
        if "%%a"=="DB_HOST" set DB_HOST=%%b
        if "%%a"=="DB_PORT" set DB_PORT=%%b
        if "%%a"=="DB_USER" set DB_USER=%%b
        if "%%a"=="DB_NAME" set DB_NAME=%%b
    )
)

REM Set defaults if not loaded from .env
if not defined DB_HOST set DB_HOST=localhost
if not defined DB_PORT set DB_PORT=3307
if not defined DB_USER set DB_USER=root
if not defined DB_NAME set DB_NAME=kasirnest

echo 📋 Database Configuration:
echo    Host: %DB_HOST%
echo    Port: %DB_PORT%
echo    User: %DB_USER%
echo    Database: %DB_NAME%
echo.

REM Check MySQL connection
echo 🔍 Testing MySQL connection...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p -e "SELECT VERSION();" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Cannot connect to MySQL. Please check:
    echo    - MySQL server is running on %DB_HOST%:%DB_PORT%
    echo    - User '%DB_USER%' has proper permissions
    echo    - Password is correct
    pause
    exit /b 1
)

echo ✅ MySQL connection successful!
echo.

REM Execute database schema
echo 📊 Creating database and tables...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p < KasirNest.sql
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to create database schema
    pause
    exit /b 1
)

echo ✅ Database schema created successfully!
echo.
echo 🎉 Database setup completed successfully!
echo.
echo 📝 Next steps:
echo    1. Install dependencies: npm install
echo    2. Start the application: npm run dev
echo    3. Access the application at http://localhost:5173
echo.
echo 🔐 Default login credentials:
echo    Email: admin@kasirnest.com
echo    Password: admin123
echo.
echo ✨ Happy coding with KasirNest!
pause