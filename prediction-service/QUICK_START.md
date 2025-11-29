# Quick Start Guide - Prediction Microservice

## Quick Setup

1. **Install Dependencies:**
   ```bash
   cd prediction-service
   pip install -r requirements.txt
   ```

2. **Run the Service:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

3. **Test the Service:**
   Visit `http://localhost:8001/docs` for interactive API documentation

## Example API Calls

### 1. Festival Prediction
```bash
curl -X POST "http://localhost:8001/api/predict/festival" \
  -H "Content-Type: application/json" \
  -d '{
    "festival_name": "Diwali",
    "start_date": "2025-11-10",
    "end_date": "2025-11-14",
    "festival_intensity": "high",
    "location": "Mumbai"
  }'
```

### 2. Pollution Prediction
```bash
curl -X POST "http://localhost:8001/api/predict/pollution" \
  -H "Content-Type: application/json" \
  -d '{
    "aqi": 185,
    "pm25": 85,
    "pm10": 120,
    "location": "Mumbai"
  }'
```

### 3. Staff Forecast
```bash
curl -X POST "http://localhost:8001/api/predict/staff" \
  -H "Content-Type: application/json" \
  -d '{
    "predicted_patient_inflow": 150,
    "current_staff_count": 50,
    "department": "emergency",
    "shift_type": "morning"
  }'
```

### 4. Combined Prediction
```bash
curl "http://localhost:8001/api/predict/combined?festival_name=Diwali&festival_start=2025-11-10&festival_end=2025-11-14&festival_intensity=high&aqi=185"
```

## Integration with Node.js Backend

The Node.js backend automatically proxies requests to this service. Just ensure:
1. This service is running on port 8001
2. Backend `.env` has `PREDICTION_SERVICE_URL=http://localhost:8001`

Then call the backend endpoints:
- `POST /api/predict/festival`
- `POST /api/predict/pollution`
- `POST /api/predict/staff`
- `GET /api/predict/combined`
- `GET /api/predict/health`

## Customization

You can adjust prediction parameters in:
- `app/services/festival_predictor.py` - Festival surge multipliers
- `app/services/pollution_predictor.py` - AQI thresholds
- `app/services/staff_forecaster.py` - Staff-to-patient ratios

