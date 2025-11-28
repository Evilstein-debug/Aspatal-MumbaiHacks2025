import React, { useState, useEffect } from "react";
import { Cloud, RefreshCw, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PollutionIndexWidget = () => {
  const [pollutionData, setPollutionData] = useState({
    aqi: 185,
    level: "Unhealthy",
    pm25: 85,
    pm10: 120,
    lastUpdated: new Date(),
    trend: "increasing"
  });

  const [loading, setLoading] = useState(false);

  // Simulate API call (placeholder)
  const fetchPollutionData = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Placeholder data - in production, replace with actual API call
    const mockData = {
      aqi: Math.floor(Math.random() * 100) + 100, // 100-200 range
      level: getAQILevel(Math.floor(Math.random() * 100) + 100),
      pm25: Math.floor(Math.random() * 50) + 50,
      pm10: Math.floor(Math.random() * 80) + 80,
      lastUpdated: new Date(),
      trend: Math.random() > 0.5 ? "increasing" : "decreasing"
    };
    
    setPollutionData(mockData);
    setLoading(false);
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return "bg-green-500";
    if (aqi <= 100) return "bg-yellow-500";
    if (aqi <= 150) return "bg-orange-500";
    if (aqi <= 200) return "bg-red-500";
    if (aqi <= 300) return "bg-purple-500";
    return "bg-red-900";
  };

  const getLevelBadge = (level) => {
    const badges = {
      "Good": <Badge className="bg-green-500 text-white">Good</Badge>,
      "Moderate": <Badge className="bg-yellow-500 text-white">Moderate</Badge>,
      "Unhealthy for Sensitive": <Badge className="bg-orange-500 text-white">Sensitive</Badge>,
      "Unhealthy": <Badge className="bg-red-500 text-white">Unhealthy</Badge>,
      "Very Unhealthy": <Badge className="bg-purple-500 text-white">Very Unhealthy</Badge>,
      "Hazardous": <Badge className="bg-red-900 text-white">Hazardous</Badge>
    };
    return badges[level] || badges.Moderate;
  };

  useEffect(() => {
    fetchPollutionData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPollutionData, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-xl">Pollution Index</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={fetchPollutionData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <CardDescription>
          Real-time air quality index (API Placeholder)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* AQI Display */}
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`w-16 h-16 rounded-full ${getAQIColor(pollutionData.aqi)} flex items-center justify-center`}>
                <span className="text-2xl font-bold text-white">
                  {pollutionData.aqi}
                </span>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Air Quality Index</p>
            <div className="flex items-center justify-center gap-2">
              {getLevelBadge(pollutionData.level)}
              {pollutionData.trend === "increasing" ? (
                <TrendingUp className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
            </div>
          </div>

          {/* PM Values */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">PM 2.5</p>
              <p className="text-xl font-bold text-gray-800">
                {pollutionData.pm25} μg/m³
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">PM 10</p>
              <p className="text-xl font-bold text-gray-800">
                {pollutionData.pm10} μg/m³
              </p>
            </div>
          </div>

          {/* Health Impact Warning */}
          {pollutionData.aqi > 150 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">
                    Health Alert
                  </p>
                  <p className="text-xs text-red-700">
                    High pollution levels may increase respiratory cases. 
                    Consider increasing respiratory department capacity.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-center text-xs text-gray-500">
            Last updated: {formatTime(pollutionData.lastUpdated)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollutionIndexWidget;

