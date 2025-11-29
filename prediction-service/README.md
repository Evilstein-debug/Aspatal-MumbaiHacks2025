# Hospital Prediction Microservice

Python microservice using FastAPI to predict patient inflow, surge risks, and staff requirements.

## Features

1. **Festival Surge Prediction** - Predicts patient inflow during festivals
2. **Pollution-Based Surge Prediction** - Predicts surge risk based on AQI levels
3. **Staff Requirement Forecast** - Forecasts required staff based on predicted patient inflow

## Setup

### Install Dependencies

```bash
cd prediction-service
pip install -r requirements.txt
```

### Run the Service

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

The service will run on `http://localhost:8001`

## API Documentation

FastAPI automatically generates interactive API documentation:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`

## API Endpoints

### 1. Festival Prediction
**POST** `/api/predict/festival`

```json
{
  "festival_name": "Diwali",
  "start_date": "2025-11-10",
  "end_date": "2025-11-14",
  "festival_intensity": "high",
  "historical_data": {
    "average_daily_patients": 120,
    "previous_year_cases": 500
  },
  "location": "Mumbai"
}
```

**Response:**
```json
{
  "success": true,
  "prediction_type": "festival_surge",
  "predicted_inflow": 960,
  "confidence": 85.0,
  "risk_level": "high",
  "recommendations": [...],
  "estimated_resources": {
    "beds": 12,
    "doctors": 2,
    "nurses": 4,
    ...
  }
}
```

### 2. Pollution Prediction
**POST** `/api/predict/pollution`

```json
{
  "aqi": 185,
  "pm25": 85,
  "pm10": 120,
  "location": "Mumbai",
  "date": "2025-01-15"
}
```

### 3. Staff Forecast
**POST** `/api/predict/staff`

```json
{
  "predicted_patient_inflow": 150,
  "current_staff_count": 50,
  "department": "emergency",
  "shift_type": "morning"
}
```

### 4. Combined Prediction
**GET** `/api/predict/combined`

Query parameters:
- `festival_name`, `festival_start`, `festival_end`, `festival_intensity`
- `aqi`
- `location`

Returns combined predictions considering all factors.

## Integration with Node.js Backend

The Node.js backend can call these endpoints using HTTP requests. Example integration is provided in the backend service.

## Configuration

The service uses rule-based prediction logic. Key parameters can be adjusted in:
- `app/services/festival_predictor.py` - Festival surge multipliers
- `app/services/pollution_predictor.py` - AQI thresholds
- `app/services/staff_forecaster.py` - Staff-to-patient ratios

## Future Enhancements

- Replace rule-based logic with machine learning models
- Add historical data analysis
- Integrate with real-time pollution APIs
- Add more sophisticated forecasting algorithms

