@echo off
setlocal
chcp 65001 >nul

:: 设置 npm 镜像源，避免每次 warning
set NPM_REGISTRY=https://registry.npmmirror.com

echo ====================================
echo   Personal Hub - 安全开发沙箱
echo ====================================
echo.

:: 检查 Docker 是否可用
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found. Make sure Docker Desktop is installed and running.
    pause
    exit /b 1
)

:: 检查容器是否已在运行
docker inspect personal-hub-dev >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/2] Building and starting sandbox...
    docker compose build dev || (
        echo [ERROR] Build failed.
        pause
        exit /b 1
    )
    docker compose up dev -d || (
        echo [ERROR] Failed to start container.
        pause
        exit /b 1
    )
    echo.
) else (
    echo [1/2] Sandbox already running, skipping startup
    echo.
)

echo [2/2] Entering sandbox development mode...
echo.
echo   Vite server: http://localhost:5173
echo   Type Ctrl+C or 'exit' to quit agent
echo.
echo   To stop the sandbox later: docker compose down dev
echo.

docker exec -it personal-hub-dev reasonix code --yolo

echo.
echo Agent exited. Sandbox is still running.
echo Run this script again to re-enter, or use: docker compose down dev
pause
