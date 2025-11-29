from typing import Optional, Dict, List
from datetime import datetime


class PollutionPredictor:
    """
    Predicts patient surge based on pollution levels (AQI)
    """
    
    # AQI thresholds and corresponding surge multipliers
    AQI_THRESHOLDS = {
        "good": {"max": 50, "multiplier": 1.0, "risk": "low"},
        "moderate": {"max": 100, "multiplier": 1.1, "risk": "low"},
        "unhealthy_sensitive": {"max": 150, "multiplier": 1.3, "risk": "medium"},
        "unhealthy": {"max": 200, "multiplier": 1.6, "risk": "high"},
        "very_unhealthy": {"max": 300, "multiplier": 2.0, "risk": "critical"},
        "hazardous": {"max": 500, "multiplier": 2.5, "risk": "critical"}
    }
    
    BASE_DAILY_RESPIRATORY_PATIENTS = 20
    
    def predict(
        self,
        aqi: float,
        pm25: Optional[float] = None,
        pm10: Optional[float] = None,
        location: Optional[str] = None,
        date: Optional[str] = None
    ) -> Dict:
        """
        Predict patient surge based on pollution levels
        """
        # Determine AQI category
        aqi_category = self._get_aqi_category(aqi)
        threshold_data = self.AQI_THRESHOLDS[aqi_category]
        
        # Calculate surge
        multiplier = threshold_data["multiplier"]
        risk_level = threshold_data["risk"]
        
        # Base respiratory patients (typically affected by pollution)
        base_respiratory = self.BASE_DAILY_RESPIRATORY_PATIENTS
        
        # Additional patients based on AQI
        if aqi <= 50:
            additional_patients = 0
        elif aqi <= 100:
            additional_patients = 5
        elif aqi <= 150:
            additional_patients = 15
        elif aqi <= 200:
            additional_patients = 30
        elif aqi <= 300:
            additional_patients = 50
        else:
            additional_patients = 80
        
        # Total predicted inflow (respiratory + general increase)
        predicted_inflow = int(base_respiratory * multiplier + additional_patients)
        
        # Calculate confidence (higher for extreme AQI values)
        if aqi >= 200:
            confidence = 90.0
        elif aqi >= 150:
            confidence = 80.0
        else:
            confidence = 70.0
        
        # Generate recommendations
        recommendations = self._generate_recommendations(aqi, aqi_category, risk_level)
        
        # Estimate resource needs
        estimated_resources = {
            "respiratory_beds": int(predicted_inflow * 0.4),
            "oxygen_cylinders": int(predicted_inflow * 0.6),
            "nebulizers": int(predicted_inflow * 0.3),
            "respiratory_medications": "High stock required",
            "ventilators": int(predicted_inflow * 0.1) if aqi > 200 else 0
        }
        
        return {
            "predicted_inflow": predicted_inflow,
            "confidence": confidence,
            "risk_level": risk_level,
            "recommendations": recommendations,
            "estimated_resources": estimated_resources,
            "factors": {
                "aqi": aqi,
                "aqi_category": aqi_category,
                "pm25": pm25,
                "pm10": pm10,
                "surge_multiplier": multiplier,
                "location": location,
                "date": date
            }
        }
    
    def _get_aqi_category(self, aqi: float) -> str:
        """Determine AQI category based on value"""
        if aqi <= 50:
            return "good"
        elif aqi <= 100:
            return "moderate"
        elif aqi <= 150:
            return "unhealthy_sensitive"
        elif aqi <= 200:
            return "unhealthy"
        elif aqi <= 300:
            return "very_unhealthy"
        else:
            return "hazardous"
    
    def _generate_recommendations(
        self,
        aqi: float,
        aqi_category: str,
        risk_level: str
    ) -> List[str]:
        """Generate recommendations based on pollution levels"""
        recommendations = []
        
        if aqi > 200:
            recommendations.append("⚠️ CRITICAL: Very high pollution levels detected")
            recommendations.append("Increase respiratory department capacity immediately")
            recommendations.append("Stock up on oxygen cylinders and nebulizers")
            recommendations.append("Alert high-risk patients (elderly, children, asthmatics)")
            recommendations.append("Consider setting up temporary respiratory care unit")
        elif aqi > 150:
            recommendations.append("High pollution levels - monitor respiratory cases closely")
            recommendations.append("Ensure adequate supply of respiratory medications")
            recommendations.append("Increase respiratory department staffing")
        elif aqi > 100:
            recommendations.append("Moderate pollution - prepare for slight increase in respiratory cases")
        
        recommendations.append(f"AQI: {aqi} ({aqi_category.upper()}) - Risk Level: {risk_level.upper()}")
        recommendations.append("Coordinate with nearby hospitals for respiratory emergencies")
        recommendations.append("Monitor air quality forecasts for upcoming days")
        
        return recommendations

