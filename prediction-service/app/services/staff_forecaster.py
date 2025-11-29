from typing import Optional, Dict, List


class StaffForecaster:
    """
    Forecasts staff requirements based on predicted patient inflow
    """
    
    # Staff to patient ratios (can be customized per department)
    STAFF_RATIOS = {
        "emergency": {
            "doctors": 0.1,  # 1 doctor per 10 patients
            "nurses": 0.2,   # 1 nurse per 5 patients
            "support": 0.05  # 1 support staff per 20 patients
        },
        "general": {
            "doctors": 0.05,
            "nurses": 0.15,
            "support": 0.03
        },
        "icu": {
            "doctors": 0.2,
            "nurses": 0.5,
            "support": 0.1
        },
        "opd": {
            "doctors": 0.08,
            "nurses": 0.12,
            "support": 0.04
        },
        "default": {
            "doctors": 0.08,
            "nurses": 0.18,
            "support": 0.04
        }
    }
    
    # Shift multipliers (for shift-based forecasting)
    SHIFT_MULTIPLIERS = {
        "morning": 1.0,
        "evening": 0.8,
        "night": 0.6
    }
    
    def forecast(
        self,
        predicted_patients: int,
        current_staff: Optional[int] = None,
        department: Optional[str] = None,
        shift_type: Optional[str] = None
    ) -> Dict:
        """
        Forecast staff requirements based on predicted patient inflow
        """
        # Get appropriate staff ratios
        department_key = (department or "default").lower()
        ratios = self.STAFF_RATIOS.get(department_key, self.STAFF_RATIOS["default"])
        
        # Calculate base requirements
        required_doctors = int(predicted_patients * ratios["doctors"])
        required_nurses = int(predicted_patients * ratios["nurses"])
        required_support = int(predicted_patients * ratios["support"])
        
        # Apply shift multiplier if specified
        if shift_type:
            shift_mult = self.SHIFT_MULTIPLIERS.get(shift_type.lower(), 1.0)
            required_doctors = int(required_doctors * shift_mult)
            required_nurses = int(required_nurses * shift_mult)
            required_support = int(required_support * shift_mult)
        
        # Ensure minimum staffing
        required_doctors = max(required_doctors, 2)
        required_nurses = max(required_nurses, 4)
        required_support = max(required_support, 2)
        
        # Calculate gap if current staff is provided
        current_gap = None
        if current_staff:
            # Assuming current_staff is total staff count
            current_doctors = int(current_staff * 0.3)  # Rough estimate
            current_nurses = int(current_staff * 0.5)
            current_support = int(current_staff * 0.2)
            
            current_gap = {
                "doctors": max(0, required_doctors - current_doctors),
                "nurses": max(0, required_nurses - current_nurses),
                "support": max(0, required_support - current_support),
                "total_gap": max(0, (required_doctors + required_nurses + required_support) - current_staff)
            }
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            required_doctors,
            required_nurses,
            required_support,
            current_gap,
            department,
            shift_type
        )
        
        return {
            "required_doctors": required_doctors,
            "required_nurses": required_nurses,
            "required_support_staff": required_support,
            "current_gap": current_gap,
            "recommendations": recommendations
        }
    
    def _generate_recommendations(
        self,
        doctors: int,
        nurses: int,
        support: int,
        gap: Optional[Dict],
        department: Optional[str],
        shift_type: Optional[str]
    ) -> List[str]:
        """Generate staffing recommendations"""
        recommendations = []
        
        total_required = doctors + nurses + support
        
        if gap and gap["total_gap"] > 0:
            recommendations.append(
                f"⚠️ Staff shortage: {gap['total_gap']} additional staff members needed"
            )
            
            if gap["doctors"] > 0:
                recommendations.append(
                    f"Require {gap['doctors']} additional doctors - consider calling on-call staff"
                )
            if gap["nurses"] > 0:
                recommendations.append(
                    f"Require {gap['nurses']} additional nurses - arrange temporary staffing"
                )
            if gap["support"] > 0:
                recommendations.append(
                    f"Require {gap['support']} additional support staff"
                )
        else:
            recommendations.append("Current staffing levels appear adequate")
        
        recommendations.append(
            f"Recommended staffing: {doctors} doctors, {nurses} nurses, {support} support staff"
        )
        
        if department:
            recommendations.append(f"For {department} department")
        
        if shift_type:
            recommendations.append(f"For {shift_type} shift")
        
        if total_required > 50:
            recommendations.append("Consider splitting workload across multiple shifts")
            recommendations.append("Coordinate with nearby hospitals for staff sharing")
        
        return recommendations

