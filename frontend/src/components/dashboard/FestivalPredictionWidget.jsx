import React, { useState } from "react";
import { Calendar, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { predictionMicroserviceAPI } from "@/lib/api";
import { toast } from "sonner";

const FestivalPredictionWidget = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState({
    festival_name: "",
    start_date: "",
    end_date: "",
    festival_intensity: "medium",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const festivals = [
    "Diwali",
    "Holi",
    "Eid",
    "Christmas",
    "New Year",
    "Dussehra",
    "Ganesh Chaturthi",
    "Durga Puja",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.festival_name || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await predictionMicroserviceAPI.predictFestivalSurge(formData);
      setResult(response);
      toast.success("Festival surge prediction generated!");
      
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

  const getRiskColor = (risk) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
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
          <Sparkles className="h-5 w-5 text-purple-600" />
          Festival Surge Prediction
        </CardTitle>
        <CardDescription>
          Predict patient inflow during festivals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="festival_name">Festival Name *</Label>
            <select
              id="festival_name"
              className="w-full px-3 py-2 border rounded-md mt-1"
              value={formData.festival_name}
              onChange={(e) =>
                setFormData({ ...formData, festival_name: e.target.value })
              }
              required
            >
              <option value="">Select a festival</option>
              {festivals.map((fest) => (
                <option key={fest} value={fest}>
                  {fest}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="intensity">Festival Intensity *</Label>
            <select
              id="intensity"
              className="w-full px-3 py-2 border rounded-md mt-1"
              value={formData.festival_intensity}
              onChange={(e) =>
                setFormData({ ...formData, festival_intensity: e.target.value })
              }
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
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
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
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
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Prediction Result
              </h3>
              <Badge className={getRiskColor(result.risk_level)}>
                {result.risk_level?.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Predicted Inflow</p>
                <p className="text-2xl font-bold text-purple-600">
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
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-white p-2 rounded">
                    <p className="font-medium">{result.estimated_resources.beds}</p>
                    <p className="text-xs text-gray-600">Beds</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-medium">{result.estimated_resources.doctors}</p>
                    <p className="text-xs text-gray-600">Doctors</p>
                  </div>
                  <div className="bg-white p-2 rounded">
                    <p className="font-medium">{result.estimated_resources.nurses}</p>
                    <p className="text-xs text-gray-600">Nurses</p>
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

export default FestivalPredictionWidget;

