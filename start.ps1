# One Front Door - PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  One Front Door - Microsoft Innovate 2026 Launcher" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "python backend\main.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "streamlit run dashboard\app.py --server.port 8501"

Write-Host ""
Write-Host "Services successfully launched:" -ForegroundColor Yellow
Write-Host "  - Omni Chat UI:       http://localhost:8000" -ForegroundColor White
Write-Host "  - Observability Dash: http://localhost:8501" -ForegroundColor White
Write-Host "  - API Docs (Swagger): http://localhost:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
