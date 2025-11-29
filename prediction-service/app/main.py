from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import sys
import os

# Add app directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.festival_predictor import FestivalPredictor
from services.pollution_predictor import PollutionPredictor
from services.staff_forecaster import StaffForecaster

app = FastAPI(
    title="Hospital Prediction Service",
    description="Microservice for predicting patient inflow, surge risks, and staff requirements",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictors
festival_predictor = FestivalPredictor()
pollution_predictor = PollutionPredictor()
staff_forecaster = StaffForecaster()


# Request/Response Models
class FestivalPredictionRequest(BaseModel):
    festival_name: str
    start_date: str  # ISO format date string
    end_date: str  # ISO format date string
    festival_intensity: str = Field(..., pattern="^(low|medium|high)$")
    historical_data: Optional[dict] = None
    location: Optional[str] = None


class PollutionPredictionRequest(BaseModel):
    aqi: float = Field(..., ge=0, le=500)
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    location: Optional[str] = None
    date: Optional[str] = None


class StaffForecastRequest(BaseModel):
    predicted_patient_inflow: int = Field(..., ge=0)
    current_staff_count: Optional[int] = None
    department: Optional[str] = None
    shift_type: Optional[str] = None


class PredictionResponse(BaseModel):
    success: bool
    prediction_type: str
    predicted_inflow: int
    confidence: float = Field(..., ge=0, le=100)
    risk_level: str
    recommendations: List[str]
    estimated_resources: Optional[dict] = None
    factors: Optional[dict] = None


class StaffForecastResponse(BaseModel):
    success: bool
    forecast_type: str
    required_doctors: int
    required_nurses: int
    required_support_staff: int
    current_gap: Optional[dict] = None
    recommendations: List[str]


@app.get("/")
async def root():
    return {
        "service": "Hospital Prediction Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "festival_prediction": "/api/predict/festival",
            "pollution_prediction": "/api/predict/pollution",
            "staff_forecast": "/api/predict/staff",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/predict/festival", response_model=PredictionResponse)
async def predict_festival_surge(request: FestivalPredictionRequest):
    """
    Predict patient inflow during festivals
    """
    try:
        result = festival_predictor.predict(
            festival_name=request.festival_name,
            start_date=request.start_date,
            end_date=request.end_date,
            intensity=request.festival_intensity,
            historical_data=request.historical_data,
            location=request.location
        )
        
        return PredictionResponse(
            success=True,
            prediction_type="festival_surge",
            **result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/pollution", response_model=PredictionResponse)
async def predict_pollution_surge(request: PollutionPredictionRequest):
    """
    Predict surge risk based on pollution levels (AQI)
    """
    try:
        result = pollution_predictor.predict(
            aqi=request.aqi,
            pm25=request.pm25,
            pm10=request.pm10,
            location=request.location,
            date=request.date
        )
        
        return PredictionResponse(
            success=True,
            prediction_type="pollution_surge",
            **result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/staff", response_model=StaffForecastResponse)
async def forecast_staff_requirements(request: StaffForecastRequest):
    """
    Forecast staff requirements based on predicted patient inflow
    """
    try:
        result = staff_forecaster.forecast(
            predicted_patients=request.predicted_patient_inflow,
            current_staff=request.current_staff_count,
            department=request.department,
            shift_type=request.shift_type
        )
        
        return StaffForecastResponse(
            success=True,
            forecast_type="staff_requirement",
            **result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/predict/combined")
async def get_combined_prediction(
    festival_name: Optional[str] = None,
    festival_start: Optional[str] = None,
    festival_end: Optional[str] = None,
    festival_intensity: Optional[str] = None,
    aqi: Optional[float] = None,
    location: Optional[str] = None
):
    """
    Get combined prediction considering both festival and pollution factors
    """
    try:
        predictions = {}
        total_predicted_inflow = 0
        all_recommendations = []
        
        # Festival prediction
        if festival_name and festival_start and festival_end and festival_intensity:
            festival_result = festival_predictor.predict(
                festival_name=festival_name,
                start_date=festival_start,
                end_date=festival_end,
                intensity=festival_intensity,
                location=location
            )
            predictions["festival"] = festival_result
            total_predicted_inflow += festival_result["predicted_inflow"]
            all_recommendations.extend(festival_result.get("recommendations", []))
        
        # Pollution prediction
        if aqi is not None:
            pollution_result = pollution_predictor.predict(
                aqi=aqi,
                location=location
            )
            predictions["pollution"] = pollution_result
            total_predicted_inflow += pollution_result["predicted_inflow"]
            all_recommendations.extend(pollution_result.get("recommendations", []))
        
        # Staff forecast based on combined inflow
        staff_result = None
        if total_predicted_inflow > 0:
            staff_result = staff_forecaster.forecast(
                predicted_patients=total_predicted_inflow
            )
            predictions["staff"] = staff_result
            all_recommendations.extend(staff_result.get("recommendations", []))
        
        return {
            "success": True,
            "combined_predicted_inflow": total_predicted_inflow,
            "predictions": predictions,
            "all_recommendations": list(set(all_recommendations))  # Remove duplicates
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

