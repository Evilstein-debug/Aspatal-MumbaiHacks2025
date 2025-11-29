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

const PredictionDashboard = ({ hospitalId = "aspatal-mumbai" }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const data = await surgeAPI.getForecast(hospitalId);
      setForecast(data);
    } catch (error) {
      toast.error("Unable to fetch surge forecast");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
    const interval = setInterval(fetchForecast, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
          pointRadius: 3
        },
        {
          label: "Predicted",
          data: [
            ...Array(forecast.history.length).fill(null),
            forecast.prediction.predictedPatientLoad
          ],
          borderColor: "rgba(244, 114, 182, 1)",
          borderDash: [6, 6],
          pointBackgroundColor: "rgba(244, 114, 182, 1)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
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
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-4 bg-gradient-to-br from-blue-50 to-white">
            <p className="text-sm text-slate-500">Predicted Load</p>
            <p className="text-4xl font-semibold text-slate-900">
              {forecast?.prediction?.predictedPatientLoad ?? "--"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Generated {forecast?.meta?.usedGemini ? "via Gemini" : "via fallback model"}
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Cloud className="h-4 w-4 text-slate-500" />
              AQI Signal
            </p>
            <p className="text-3xl font-semibold text-slate-900">
              {forecast?.signals?.latestAqi ?? "--"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Citywide respiratory risk indicator</p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-500" />
              Surge Level
            </p>
            <Badge className={`${surgeLevelStyles[surgeLevel] || "bg-gray-100 text-gray-700"} mt-2`}>
              {surgeLevel}
            </Badge>
            <p className="text-xs text-slate-500 mt-2">{festivalMessage}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-slate-800">Last 7 Days vs Prediction</p>
              <p className="text-xs text-slate-500">
                ICU avg {forecast?.signals?.avgIcuUsage ?? "--"} beds · Oxygen avg{" "}
                {forecast?.signals?.avgOxygenConsumption ?? "--"} L
              </p>
            </div>
            {chartData ? (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      min: 150,
                      grid: { color: "rgba(148, 163, 184, 0.2)" },
                      ticks: { color: "#475569" }
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: "#475569" }
                    }
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { intersect: false }
                  }
                }}
                className="h-64"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                Waiting for history data...
              </div>
            )}
          </div>

          <div className="rounded-2xl border p-4 bg-slate-50">
            <p className="font-semibold text-slate-800 mb-2">Recommended Actions</p>
            {recommendations.length ? (
              <ul className="space-y-3">
                {recommendations.map((rec) => (
                  <li key={rec} className="flex items-start gap-2 text-sm text-slate-700">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No urgent actions required.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="font-semibold text-slate-800 mb-3">Rationale</p>
          <p className="text-sm text-slate-600">{forecast?.prediction?.reasoning}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="px-3 py-1 rounded-full bg-slate-100">
              Weekend load avg {forecast?.signals?.weekendLoad ?? "--"}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100">
              Data window {forecast?.history?.length ?? 0} days
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100">
              Generated {forecast?.meta?.generatedAt ? new Date(forecast.meta.generatedAt).toLocaleString() : "--"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionDashboard;

