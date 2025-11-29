import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Cloud,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { surgeAPI } from "@/lib/api";
import { toast } from "sonner";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const surgeLevelStyles = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-rose-100 text-rose-700"
};

// Static mock data
const STATIC_FORECAST = {
  history: [
    { date: "2024-11-22", patientCount: 185 },
    { date: "2024-11-23", patientCount: 192 },
    { date: "2024-11-24", patientCount: 178 },
    { date: "2024-11-25", patientCount: 210 },
    { date: "2024-11-26", patientCount: 198 },
    { date: "2024-11-27", patientCount: 215 },
    { date: "2024-11-28", patientCount: 223 }
  ],
  prediction: {
    predictedPatientLoad: 245,
    surgeLevel: "MEDIUM",
    recommendations: [
      "Increase ICU staff by 15% for next 48 hours",
      "Pre-stock oxygen supplies - AQI trending upward",
      "Alert emergency department about potential surge",
      "Consider activating overflow bed capacity",
      "Schedule additional nursing shifts for weekend"
    ],
    reasoning: "Prediction based on 7-day moving average showing 12% upward trend, elevated AQI levels (165 - Unhealthy), and upcoming festival (Diwali in 2 days). Historical data indicates 20-30% surge during festival periods combined with poor air quality. Model confidence: 87%."
  },
  signals: {
    latestAqi: 165,
    avgIcuUsage: 24,
    avgOxygenConsumption: 68,
    weekendLoad: 201,
    festivalProximity: {
      isFestivalNearby: true,
      festival: {
        name: "Diwali",
        date: "2024-11-01",
        daysAway: 2
      }
    }
  },
  meta: {
    hospitalId: "aspatal-mumbai",
    generatedAt: new Date().toISOString(),
    usedGemini: true
  }
};

const PredictionDashboard = ({ hospitalId = "default" }) => {
  const [forecast, setForecast] = useState(STATIC_FORECAST); // Use static data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔍 Fetching surge forecast for:", hospitalId);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use static data instead of API call
      setForecast(STATIC_FORECAST);
      toast.success("Surge forecast updated (using static data)");
    } catch (error) {
      console.error("❌ Surge forecast error:", error);
      setError(error.message);
      toast.error("Unable to fetch surge forecast");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set initial static data
    setForecast(STATIC_FORECAST);
  }, [hospitalId]);

  const chartData = useMemo(() => {
    if (!forecast?.history?.length || !forecast?.prediction) {
      return null;
    }

    const labels = forecast.history.map((day) =>
      new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    );

    const actualValues = forecast.history.map((day) => day.patientCount);
    labels.push("Tomorrow");
    actualValues.push(null);

    return {
      labels,
      datasets: [
        {
          label: "Actual Patients",
          data: actualValues,
          borderColor: "rgba(37, 99, 235, 1)",
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: "Predicted",
          data: [
            ...Array(forecast.history.length).fill(null),
            forecast.prediction.predictedPatientLoad
          ],
          borderColor: "rgba(244, 114, 182, 1)",
          backgroundColor: "rgba(244, 114, 182, 0.2)",
          borderDash: [6, 6],
          pointBackgroundColor: "rgba(244, 114, 182, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.2
        }
      ]
    };
  }, [forecast]);

  const surgeLevel = forecast?.prediction?.surgeLevel || "LOW";
  const festivalInfo = forecast?.signals?.festivalProximity;
  const recommendations = forecast?.prediction?.recommendations || [];
  const festivalMessage = useMemo(() => {
    if (!festivalInfo?.isFestivalNearby || !festivalInfo?.festival) {
      return "No festival trigger in the next 72h";
    }
    const daysAway = festivalInfo.festival.daysAway ?? 0;
    const timing =
      daysAway === 0 ? "today" : daysAway > 0 ? `in ${daysAway}d` : `${Math.abs(daysAway)}d ago`;
    return `Festival proximity: ${festivalInfo.festival.name} (${timing})`;
  }, [festivalInfo]);

  if (!forecast && loading) {
    return (
      <Card>
        <CardContent className="p-10 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (error && !forecast) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchForecast}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Predictive Surge Intelligence
          </CardTitle>
          <CardDescription>
            Gemini-enhanced surge forecasting with AQI, festival, and trend awareness
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchForecast} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-4 bg-gradient-to-br from-blue-50 to-white shadow-sm">
            <p className="text-sm text-slate-500 mb-2">Predicted Load</p>
            <p className="text-4xl font-bold text-slate-900">
              {forecast?.prediction?.predictedPatientLoad ?? "--"}
            </p>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Generated {forecast?.meta?.usedGemini ? "via Gemini AI" : "via fallback model"}
            </p>
          </div>
          <div className="rounded-2xl border p-4 bg-gradient-to-br from-slate-50 to-white shadow-sm">
            <p className="text-sm text-slate-500 flex items-center gap-2 mb-2">
              <Cloud className="h-4 w-4 text-slate-500" />
              AQI Signal
            </p>
            <p className="text-4xl font-bold text-orange-600">
              {forecast?.signals?.latestAqi ?? "--"}
            </p>
            <p className="text-xs text-slate-500 mt-2">Unhealthy - High respiratory risk</p>
          </div>
          <div className="rounded-2xl border p-4 bg-gradient-to-br from-amber-50 to-white shadow-sm">
            <p className="text-sm text-slate-500 flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-slate-500" />
              Surge Level
            </p>
            <Badge className={`${surgeLevelStyles[surgeLevel] || "bg-gray-100 text-gray-700"} mt-2 text-base px-4 py-1`}>
              {surgeLevel}
            </Badge>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {festivalMessage}
            </p>
          </div>
        </div>

        {/* Chart and Recommendations */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border p-6 lg:col-span-2 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-semibold text-slate-800 text-lg">7-Day Trend vs Prediction</p>
                <p className="text-xs text-slate-500 mt-1">Historical patient load with tomorrow's forecast</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  ICU avg <span className="font-semibold text-slate-700">{forecast?.signals?.avgIcuUsage ?? "--"}</span> beds
                </p>
                <p className="text-xs text-slate-500">
                  O₂ avg <span className="font-semibold text-slate-700">{forecast?.signals?.avgOxygenConsumption ?? "--"}</span> L/min
                </p>
              </div>
            </div>
            {chartData ? (
              <div className="h-72">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        min: 150,
                        max: 260,
                        grid: { color: "rgba(148, 163, 184, 0.15)" },
                        ticks: { 
                          color: "#475569",
                          font: { size: 11 }
                        }
                      },
                      x: {
                        grid: { display: false },
                        ticks: { 
                          color: "#475569",
                          font: { size: 11 }
                        }
                      }
                    },
                    plugins: {
                      legend: { 
                        display: true,
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          padding: 15,
                          font: { size: 12 }
                        }
                      },
                      tooltip: { 
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        padding: 12,
                        titleFont: { size: 13 },
                        bodyFont: { size: 12 }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-72 text-slate-400 text-sm">
                Waiting for history data...
              </div>
            )}
          </div>

          <div className="rounded-2xl border p-6 bg-gradient-to-br from-slate-50 to-white shadow-sm">
            <p className="font-semibold text-slate-800 mb-4 text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Action Items
            </p>
            {recommendations.length ? (
              <ul className="space-y-4">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-700 p-3 bg-white rounded-lg border border-slate-100">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No urgent actions required.</p>
            )}
          </div>
        </div>

        {/* Rationale Section */}
        <div className="rounded-2xl border p-6 bg-gradient-to-br from-blue-50 to-white shadow-sm">
          <p className="font-semibold text-slate-800 mb-3 text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI Analysis & Rationale
          </p>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            {forecast?.prediction?.reasoning}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-600 font-medium">
              📊 Weekend load avg: {forecast?.signals?.weekendLoad ?? "--"} patients
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-600 font-medium">
              📅 Data window: {forecast?.history?.length ?? 0} days
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-600 font-medium">
              🕐 Generated: {forecast?.meta?.generatedAt ? new Date(forecast.meta.generatedAt).toLocaleString() : "--"}
            </span>
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xs text-white font-medium">
              ✨ AI-Powered by Gemini
            </span>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <p className="text-xs text-slate-500 mb-1">Trend Direction</p>
            <p className="text-2xl font-bold text-red-600">↗ +12%</p>
          </div>
          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <p className="text-xs text-slate-500 mb-1">Model Confidence</p>
            <p className="text-2xl font-bold text-green-600">87%</p>
          </div>
          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <p className="text-xs text-slate-500 mb-1">Peak Hour Load</p>
            <p className="text-2xl font-bold text-blue-600">2-4 PM</p>
          </div>
          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <p className="text-xs text-slate-500 mb-1">Risk Score</p>
            <p className="text-2xl font-bold text-amber-600">6.8/10</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionDashboard;