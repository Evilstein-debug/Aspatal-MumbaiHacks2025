import React, { useState } from "react";
import { Users, UserCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { predictionMicroserviceAPI } from "@/lib/api";
import { toast } from "sonner";

const StaffForecastWidget = ({ onForecastComplete }) => {
  const [formData, setFormData] = useState({
    predicted_patient_inflow: "",
    current_staff_count: "",
    department: "",
    shift_type: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const departments = [
    "emergency",
    "general",
    "icu",
    "opd",
  ];

  const shifts = ["morning", "evening", "night"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.predicted_patient_inflow || formData.predicted_patient_inflow < 0) {
      toast.error("Please enter a valid predicted patient inflow");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload = {
        predicted_patient_inflow: parseInt(formData.predicted_patient_inflow),
        ...(formData.current_staff_count && {
          current_staff_count: parseInt(formData.current_staff_count),
        }),
        ...(formData.department && { department: formData.department }),
        ...(formData.shift_type && { shift_type: formData.shift_type }),
      };

      const response = await predictionMicroserviceAPI.forecastStaff(payload);
      setResult(response);
      toast.success("Staff forecast generated!");
      
      if (onForecastComplete) {
        onForecastComplete(response);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          "Failed to generate forecast";
      
      if (error.response?.status === 503) {
        toast.error(
          "Prediction service is unavailable. Please start the Python microservice.",
          {
            description: "Run: cd prediction-service && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001",
            duration: 10000
          }
        );
        setResult({
          error: true,
          message: errorMessage,
          details: error.response?.data?.help
        });
      } else {
        toast.error(errorMessage);
      }
      console.error("Forecast error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-blue-600" />
          Staff Requirement Forecast
        </CardTitle>
        <CardDescription>
          Calculate required staff based on predicted patient inflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="predicted_patient_inflow">Predicted Patient Inflow *</Label>
            <Input
              id="predicted_patient_inflow"
              type="number"
              min="0"
              placeholder="e.g., 150"
              value={formData.predicted_patient_inflow}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  predicted_patient_inflow: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="current_staff_count">Current Staff Count (Optional)</Label>
            <Input
              id="current_staff_count"
              type="number"
              min="0"
              placeholder="e.g., 50"
              value={formData.current_staff_count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  current_staff_count: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department (Optional)</Label>
              <select
                id="department"
                className="w-full px-3 py-2 border rounded-md mt-1"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="shift_type">Shift Type (Optional)</Label>
              <select
                id="shift_type"
                className="w-full px-3 py-2 border rounded-md mt-1"
                value={formData.shift_type}
                onChange={(e) =>
                  setFormData({ ...formData, shift_type: e.target.value })
                }
              >
                <option value="">All Shifts</option>
                {shifts.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift.charAt(0).toUpperCase() + shift.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Forecast Staff
              </>
            )}
          </Button>
        </form>

        {result && result.error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-lg text-red-800">Service Unavailable</h3>
            </div>
            <p className="text-sm text-red-700 mb-2">{result.message}</p>
            {result.details && (
              <div className="bg-white p-3 rounded border border-red-200">
                <p className="text-xs font-mono text-gray-800">{result.details}</p>
              </div>
            )}
          </div>
        )}

        {result && !result.error && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">Forecast Result</h3>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Doctors</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.required_doctors}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Nurses</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {result.required_nurses}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Support</p>
                <p className="text-2xl font-bold text-purple-600">
                  {result.required_support_staff}
                </p>
              </div>
            </div>

            {result.current_gap && result.current_gap.total_gap > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-semibold text-red-800">
                    Staff Shortage: {result.current_gap.total_gap} additional staff needed
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Doctors: </span>
                    <span className="font-semibold text-red-600">
                      +{result.current_gap.doctors}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Nurses: </span>
                    <span className="font-semibold text-red-600">
                      +{result.current_gap.nurses}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Support: </span>
                    <span className="font-semibold text-red-600">
                      +{result.current_gap.support}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Recommendations:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {result.recommendations.slice(0, 4).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffForecastWidget;

