import React, { useState, useEffect } from "react";
import { TrendingUp, Cloud, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { predictionAPI } from "@/lib/api";
import { toast } from "sonner";

const PredictionDashboard = ({ hospitalId = "default" }) => {
  const [predictions, setPredictions] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allPredictions, upcomingData] = await Promise.all([
        predictionAPI.getPredictions(hospitalId),
        predictionAPI.getUpcoming(hospitalId),
      ]);
      setPredictions(allPredictions);
      setUpcoming(upcomingData);
    } catch (error) {
      toast.error("Failed to fetch prediction data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [hospitalId]);

  const typeColors = {
    pollution: "bg-orange-100 text-orange-800 border-orange-300",
    festival: "bg-purple-100 text-purple-800 border-purple-300",
    seasonal: "bg-blue-100 text-blue-800 border-blue-300",
    general: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Surge Predictions
            </CardTitle>
            <CardDescription className="mt-2">
              Pollution spikes and festival season surge predictions
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Upcoming Predictions */}
        {upcoming.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Predictions
            </h3>
            <div className="space-y-3">
              {upcoming.map((prediction) => (
                <div
                  key={prediction._id}
                  className="p-4 border-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={typeColors[prediction.predictionType]}>
                        {prediction.predictionType}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDate(prediction.date)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        +{prediction.predictedSurge}
                      </p>
                      <p className="text-xs text-gray-500">predicted surge</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Confidence</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${prediction.confidence}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {prediction.confidence}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Resource Needs</p>
                      <p className="text-sm font-medium">
                        {prediction.estimatedResourceNeeds?.beds || 0} beds,{" "}
                        {prediction.estimatedResourceNeeds?.doctors || 0} doctors
                      </p>
                    </div>
                  </div>
                  {prediction.recommendations && prediction.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Recommendations:
                      </p>
                      <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                        {prediction.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {prediction.factors?.pollutionLevel && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Cloud className="h-4 w-4 text-orange-600" />
                      <span className="text-gray-600">
                        Pollution Level: {prediction.factors.pollutionLevel} AQI
                      </span>
                    </div>
                  )}
                  {prediction.factors?.festivalName && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-600">
                        {prediction.factors.festivalName} (
                        {prediction.factors.festivalIntensity} intensity)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Predictions */}
        <div>
          <h3 className="text-lg font-semibold mb-3">All Predictions</h3>
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No predictions available
            </div>
          ) : (
            <div className="space-y-2">
              {predictions.slice(0, 5).map((prediction) => (
                <div
                  key={prediction._id}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={typeColors[prediction.predictionType]}>
                        {prediction.predictionType}
                      </Badge>
                      <span className="text-sm">{formatDate(prediction.date)}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">+{prediction.predictedSurge}</p>
                      <p className="text-xs text-gray-500">
                        {prediction.confidence}% confidence
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionDashboard;

