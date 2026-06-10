@echo off
chcp 65001 >nul
echo Stopping development sandbox...
docker compose down dev
echo Stopped.
pause
