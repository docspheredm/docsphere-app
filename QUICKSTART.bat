@echo off
REM MediVoice Records - Quick Start Script (Windows)

echo.
echo ========================================
echo 7 MediVoice Records - Quick Start Setup
echo ========================================
echo.

REM Check Node.js version
echo Checking Node.js version...
node -v
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if errorlevel 1 goto error
echo Dependencies installed
echo.

REM Check for .env.local
if not exist .env.local (
    echo Creating .env.local template...
    (
        echo # Supabase Configuration
        echo NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
        echo SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
        echo.
        echo # OpenAI Configuration
        echo OPENAI_API_KEY=sk_your_api_key_here
        echo.
        echo # App Configuration
        echo NEXT_PUBLIC_API_URL=http://localhost:3000
    ) > .env.local
    echo Created .env.local template - please update with your keys
    echo.
) else (
    echo .env.local already exists
    echo.
)

REM Create directories
echo Creating project directories...
if not exist src\app\api\patients mkdir src\app\api\patients
if not exist src\app\api\encounters mkdir src\app\api\encounters
if not exist src\app\api\reminders mkdir src\app\api\reminders
if not exist src\app\api\investigations mkdir src\app\api\investigations
echo Directories ready
echo.

REM Display important files
echo.
echo IMPORTANT FILES:
echo   - MEDICAL_APP_README.md ........... Complete feature overview
echo   - SUPABASE_SETUP.md .............. Database setup guide
echo   - REACT_NATIVE_SETUP.md .......... Mobile app guide
echo   - IMPLEMENTATION_CHECKLIST.md .... Implementation roadmap
echo.

echo NEXT STEPS:
echo   1. Update .env.local with your Supabase ^& OpenAI keys
echo   2. Read: SUPABASE_SETUP.md (set up database^)
echo   3. Run: npm run dev
echo   4. Open: http://localhost:3000
echo.

echo SETUP COMPLETE!
echo.
echo For help, check MEDICAL_APP_README.md
echo.
goto end

:error
echo ERROR: Installation failed
exit /b 1

:end
