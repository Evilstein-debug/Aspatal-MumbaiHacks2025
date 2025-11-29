import React, { useState } from "react";
import { Cloud, Wind, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { predictionMicroserviceAPI } from "@/lib/api";
import { toast } from "sonner";

const PollutionPredictionWidget = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState({
    aqi: "",
    pm25: "",
    pm10: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.aqi || formData.aqi < 0 || formData.aqi > 500) {
      toast.error("Please enter a valid AQI value (0-500)");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload = {
        aqi: parseFloat(formData.aqi),
        ...(formData.pm25 && { pm25: parseFloat(formData.pm25) }),
        ...(formData.pm10 && { pm10: parseFloat(formData.pm10) }),
        ...(formData.location && { location: formData.location }),
      };

      const response = await predictionMicroserviceAPI.predictPollutionSurge(payload);
      setResult(response);
      toast.success("Pollution surge prediction generated!");
      
      if (onPredictionComplete) {
        onPredictionComplete(response);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          "Failed to generate prediction";
      
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
      console.error("Prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return "text-green-600";
    if (aqi <= 100) return "text-yellow-600";
    if (aqi <= 150) return "text-orange-600";
    if (aqi <= 200) return "text-red-600";
    if (aqi <= 300) return "text-purple-600";
    return "text-red-800";
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-green-100 text-green-800 border-green-300";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Cloud className="h-5 w-5 text-orange-600" />
          Pollution Surge Prediction
        </CardTitle>
        <CardDescription>
          Predict patient surge based on air quality (AQI)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="aqi">Air Quality Index (AQI) *</Label>
            <Input
              id="aqi"
              type="number"
              min="0"
              max="500"
              placeholder="0-500"
              value={formData.aqi}
              onChange={(e) =>
                setFormData({ ...formData, aqi: e.target.value })
              }
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Current AQI level (0-50: Good, 51-100: Moderate, 101-150: Unhealthy for Sensitive, 151-200: Unhealthy, 201-300: Very Unhealthy, 301-500: Hazardous)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pm25">PM 2.5 (Optional)</Label>
              <Input
                id="pm25"
                type="number"
                placeholder="μg/m³"
                value={formData.pm25}
                onChange={(e) =>
                  setFormData({ ...formData, pm25: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="pm10">PM 10 (Optional)</Label>
              <Input
                id="pm10"
                type="number"
                placeholder="μg/m³"
                value={formData.pm10}
                onChange={(e) =>
                  setFormData({ ...formData, pm10: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., Mumbai"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <Wind className="h-4 w-4 mr-2" />
                Predict Surge
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
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Prediction Result
              </h3>
              <Badge className={getRiskColor(result.risk_level)}>
                {result.risk_level?.toUpperCase()}
              </Badge>
            </div>

            {result.factors && (
              <div className="mb-4 flex items-center gap-2">
                <Cloud className="h-5 w-5 text-orange-600" />
                <span className="text-sm">
                  AQI: <span className={`font-bold ${getAQIColor(result.factors.aqi)}`}>
                    {result.factors.aqi}
                  </span>
                  {" "}({result.factors.aqi_category?.replace(/_/g, " ")?.toUpperCase()})
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Predicted Inflow</p>
                <p className="text-2xl font-bold text-orange-600">
                  {result.predicted_inflow}
                </p>
                <p className="text-xs text-gray-500">patients</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.confidence?.toFixed(1)}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${result.confidence || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {result.estimated_resources && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Estimated Resources Needed:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white p-2 rounded">
                    <p className="font-medium">{result.estimated_resources.respiratory_beds}</p>
                    <p className="text-xs text-gray-600">Respiratory Beds</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-medium">{result.estimated_resources.oxygen_cylinders}</p>
                    <p className="text-xs text-gray-600">Oxygen Cylinders</p>
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

export default PollutionPredictionWidget;

