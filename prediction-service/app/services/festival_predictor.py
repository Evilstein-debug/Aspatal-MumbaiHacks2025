from datetime import datetime, timedelta
from typing import Optional, Dict, List


class FestivalPredictor:
    """
    Predicts patient inflow during festivals using rule-based logic
    """
    
    # Base surge multipliers for different festivals
    FESTIVAL_BASE_SURGE = {
        "diwali": {"low": 1.3, "medium": 1.6, "high": 2.0},
        "holi": {"low": 1.2, "medium": 1.5, "high": 1.8},
        "eid": {"low": 1.2, "medium": 1.4, "high": 1.7},
        "christmas": {"low": 1.1, "medium": 1.3, "high": 1.6},
        "new_year": {"low": 1.2, "medium": 1.5, "high": 1.9},
        "dussehra": {"low": 1.2, "medium": 1.4, "high": 1.7},
        "ganesh_chaturthi": {"low": 1.3, "medium": 1.6, "high": 2.1},
        "durga_puja": {"low": 1.2, "medium": 1.5, "high": 1.8},
        "default": {"low": 1.2, "medium": 1.4, "high": 1.7}
    }
    
    # Base daily patient count (can be customized based on hospital size)
    BASE_DAILY_PATIENTS = 100
    
    def predict(
        self,
        festival_name: str,
        start_date: str,
        end_date: str,
        intensity: str,
        historical_data: Optional[Dict] = None,
        location: Optional[str] = None
    ) -> Dict:
        """
        Predict patient inflow during festival period
        """
        # Parse dates
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        duration_days = (end - start).days + 1
        
        # Get base surge multiplier
        festival_key = festival_name.lower().replace(" ", "_")
        surge_multipliers = self.FESTIVAL_BASE_SURGE.get(
            festival_key,
            self.FESTIVAL_BASE_SURGE["default"]
        )
        
        multiplier = surge_multipliers.get(intensity, surge_multipliers["medium"])
        
        # Calculate base daily patients
        if historical_data and "average_daily_patients" in historical_data:
            base_patients = historical_data["average_daily_patients"]
        elif historical_data and "previous_year_cases" in historical_data:
            # Estimate from previous year cases
            base_patients = historical_data["previous_year_cases"] / duration_days
        else:
            base_patients = self.BASE_DAILY_PATIENTS
        
        # Calculate predicted inflow
        daily_surge = base_patients * multiplier
        predicted_inflow = int(daily_surge * duration_days)
        
        # Calculate confidence based on historical data availability
        confidence = 85.0 if historical_data else 65.0
        
        # Determine risk level
        if multiplier >= 1.8:
            risk_level = "high"
        elif multiplier >= 1.4:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            festival_name, intensity, predicted_inflow, duration_days
        )
        
        # Estimate resource needs
        estimated_resources = {
            "beds": int(predicted_inflow * 0.3 / duration_days),
            "doctors": int(predicted_inflow * 0.05 / duration_days),
            "nurses": int(predicted_inflow * 0.1 / duration_days),
            "ambulances": int(predicted_inflow * 0.02 / duration_days),
            "equipment": [
                "Oxygen cylinders",
                "Emergency medication",
                "Monitoring devices"
            ]
        }
        
        return {
            "predicted_inflow": predicted_inflow,
            "confidence": confidence,
            "risk_level": risk_level,
            "recommendations": recommendations,
            "estimated_resources": estimated_resources,
            "factors": {
                "festival_name": festival_name,
                "intensity": intensity,
                "duration_days": duration_days,
                "surge_multiplier": multiplier,
                "base_daily_patients": base_patients,
                "location": location
            }
        }
    
    def _generate_recommendations(
        self,
        festival_name: str,
        intensity: str,
        predicted_inflow: int,
        duration_days: int
    ) -> List[str]:
        """Generate recommendations based on prediction"""
        recommendations = []
        
        recommendations.append(
            f"Prepare for {festival_name} - Expected {predicted_inflow} patients over {duration_days} days"
        )
        
        if intensity == "high":
            recommendations.append("Increase emergency department capacity by 50%")
            recommendations.append("Arrange additional ambulance services")
            recommendations.append("Coordinate with nearby hospitals for overflow capacity")
        elif intensity == "medium":
            recommendations.append("Increase emergency department capacity by 30%")
            recommendations.append("Ensure adequate staffing during peak hours")
        
        recommendations.append("Stock up on festival-related injury medications")
        recommendations.append("Increase respiratory department capacity (fireworks/air quality)")
        recommendations.append("Prepare for alcohol-related incidents")
        recommendations.append("Ensure 24/7 availability of key departments")
        
        return recommendations

