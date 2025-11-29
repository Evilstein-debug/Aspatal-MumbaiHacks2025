@echo off
echo Starting Prediction Microservice...
echo.
echo Make sure you've installed dependencies first:
echo   pip install -r requirements.txt
echo.
echo Starting server on http://localhost:8001
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

