@echo off
title One Front Door - Multi-Agent Enterprise Orchestrator
echo ========================================================
echo   One Front Door - Enterprise Orchestration Platform
echo ========================================================
echo Starting FastAPI Orchestration Gateway on port 8000...
start cmd /k "python backend\main.py"

echo Starting Streamlit Admin Dashboard on port 8501...
start cmd /k "streamlit run dashboard\app.py --server.port 8501"

echo.
echo ========================================================
echo Services are online:
echo - Omni Chat UI:       http://localhost:8000
echo - Observability Dash: http://localhost:8501
echo - API Docs (Swagger): http://localhost:8000/docs
echo ========================================================
pause
