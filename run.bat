@echo off
title Flux Analytics Dashboard - Server Launcher

echo ===================================================
echo Starting Flux Analytics Backend (FastAPI)
echo ===================================================
start "Flux Backend" cmd /k "cd backend && uvicorn main:app --reload --host 127.0.0.1 --port 8000"

echo.
echo ===================================================
echo Starting Flux Analytics Frontend (React/Vite)
echo ===================================================
start "Flux Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching in separate windows!
echo Backend API will be at: http://localhost:8000
echo Frontend UI will be at: http://localhost:5173
echo.
echo Close those command windows to stop the servers when you are done.
