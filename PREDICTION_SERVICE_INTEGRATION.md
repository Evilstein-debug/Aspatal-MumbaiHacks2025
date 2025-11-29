# Prediction Microservice Integration Guide

This document describes the Python prediction microservice integration with the Node.js backend.

## Architecture

```
Frontend (React)
    ↓
Backend (Node.js/Express)
    ↓
Prediction Service (Python/FastAPI)
```

The Node.js backend acts as a proxy, forwarding prediction requests to the Python microservice.

## Components

### 1. Python Microservice (`prediction-service/`)

**Location:** `prediction-service/app/`

**Main Files:**
- `main.py` - FastAPI application with all endpoints
- `services/festival_predictor.py` - Festival surge prediction logic
- `services/pollution_predictor.py` - Pollution-based surge prediction
- `services/staff_forecaster.py` - Staff requirement forecasting

**Endpoints:**
- `POST /api/predict/festival` - Predict festival surge
- `POST /api/predict/pollution` - Predict pollution surge
- `POST /api/predict/staff` - Forecast staff requirements
- `GET /api/predict/combined` - Combined prediction
- `GET /health` - Health check

### 2. Node.js Integration

**Service Client:** `backend/src/services/predictionService.js`
- HTTP client using Axios to communicate with Python service
- Error handling and logging

**Controllers:** `backend/src/controllers/predictionMicroserviceController.js`
- Proxy controllers that forward requests to Python service
- Optional hospitalId parameter handling

**Routes:** `backend/src/routes/predictionMicroserviceRoutes.js`
- Express routes mounted at `/api/predict/*`

## Setup

### 1. Install Python Dependencies

```bash
cd prediction-service
pip install -r requirements.txt
```

### 2. Start Python Service

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 3. Configure Backend

Add to `backend/.env`:
```env
PREDICTION_SERVICE_URL=http://localhost:8001
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install  # This will install axios if not already installed
```

## API Usage Examples

### Festival Prediction

**Via Node.js Backend:**
```bash
curl -X POST http://localhost:8000/api/predict/festival \
  -H "Content-Type: application/json" \
  -d '{
    "festival_name": "Diwali",
    "start_date": "2025-11-10",
    "end_date": "2025-11-14",
    "festival_intensity": "high",
    "location": "Mumbai"
  }'
```

**Direct to Python Service:**
```bash
curl -X POST http://localhost:8001/api/predict/festival \
  -H "Content-Type: application/json" \
  -d '{
    "festival_name": "Diwali",
    "start_date": "2025-11-10",
    "end_date": "2025-11-14",
    "festival_intensity": "high"
  }'
```

### Pollution Prediction

```bash
curl -X POST http://localhost:8000/api/predict/pollution \
  -H "Content-Type: application/json" \
  -d '{
    "aqi": 185,
    "pm25": 85,
    "pm10": 120,
    "location": "Mumbai"
  }'
```

### Staff Forecast

```bash
curl -X POST http://localhost:8000/api/predict/staff \
  -H "Content-Type: application/json" \
  -d '{
    "predicted_patient_inflow": 150,
    "current_staff_count": 50,
    "department": "emergency",
    "shift_type": "morning"
  }'
```

## Response Formats

### Festival/Pollution Prediction Response

```json
{
  "success": true,
  "prediction_type": "festival_surge",
  "predicted_inflow": 960,
  "confidence": 85.0,
  "risk_level": "high",
  "recommendations": [
    "Prepare for Diwali - Expected 960 patients over 5 days",
    "Increase emergency department capacity by 50%"
  ],
  "estimated_resources": {
    "beds": 12,
    "doctors": 2,
    "nurses": 4
  },
  "factors": {
    "festival_name": "Diwali",
    "intensity": "high",
    "duration_days": 5
  }
}
```

### Staff Forecast Response

```json
{
  "success": true,
  "forecast_type": "staff_requirement",
  "required_doctors": 15,
  "required_nurses": 30,
  "required_support_staff": 6,
  "current_gap": {
    "doctors": 5,
    "nurses": 10,
    "support": 2,
    "total_gap": 17
  },
  "recommendations": [
    "⚠️ Staff shortage: 17 additional staff members needed",
    "Require 5 additional doctors - consider calling on-call staff"
  ]
}
```

## Customization

### Adjust Festival Surge Multipliers

Edit `prediction-service/app/services/festival_predictor.py`:

```python
FESTIVAL_BASE_SURGE = {
    "diwali": {"low": 1.3, "medium": 1.6, "high": 2.0},
    # Add or modify festivals
}
```

### Adjust AQI Thresholds

Edit `prediction-service/app/services/pollution_predictor.py`:

```python
AQI_THRESHOLDS = {
    "unhealthy": {"max": 200, "multiplier": 1.6, "risk": "high"},
    # Modify thresholds
}
```

### Adjust Staff Ratios

Edit `prediction-service/app/services/staff_forecaster.py`:

```python
STAFF_RATIOS = {
    "emergency": {
        "doctors": 0.1,  # 1 doctor per 10 patients
        "nurses": 0.2,   # 1 nurse per 5 patients
        # Modify ratios
    }
}
```

## Error Handling

The Node.js backend gracefully handles Python service failures:

1. **Service Unavailable:** Returns 503 with error message
2. **Invalid Request:** Returns 400/500 based on Python service response
3. **Health Check:** Returns service status

## Future Enhancements

1. **Machine Learning Models:**
   - Replace rule-based logic with trained ML models
   - Use historical data for predictions
   - Implement time series forecasting

2. **Real-time Data Integration:**
   - Connect to real AQI/pollution APIs
   - Fetch real-time festival dates
   - Historical hospital data integration

3. **Advanced Features:**
   - Multi-factor predictions (combine weather, events, etc.)
   - Department-specific predictions
   - Long-term forecasting (monthly/quarterly)

## Troubleshooting

### Service Not Responding

1. Check if Python service is running:
   ```bash
   curl http://localhost:8001/health
   ```

2. Check backend logs for connection errors

3. Verify `PREDICTION_SERVICE_URL` in backend `.env`

### Prediction Errors

1. Check Python service logs
2. Verify request format matches API documentation
3. Check FastAPI docs: `http://localhost:8001/docs`

### Port Conflicts

Change port in:
- Python service: `uvicorn app.main:app --port 8002`
- Backend `.env`: `PREDICTION_SERVICE_URL=http://localhost:8002`

## Testing

### Test Python Service Directly

Visit `http://localhost:8001/docs` for interactive API testing.

### Test via Backend

Use the backend endpoints which proxy to Python service:
- `GET /api/predict/health` - Health check
- All prediction endpoints work the same way

## Production Deployment

1. **Python Service:**
   - Use production ASGI server (Gunicorn + Uvicorn workers)
   - Set up proper logging
   - Add authentication/API keys
   - Use environment variables for configuration

2. **Backend:**
   - Update `PREDICTION_SERVICE_URL` to production URL
   - Add retry logic for service calls
   - Implement caching for predictions
   - Add rate limiting

