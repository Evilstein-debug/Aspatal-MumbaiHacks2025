import React, { useState, useEffect } from "react";
import { TrendingUp, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const PredictivePatientInflow = () => {
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d

  // Dummy data for patient inflow prediction
  const generateDummyData = (days) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic-looking data with some variation
      const baseInflow = 120;
      const variation = Math.sin(i * 0.5) * 20 + Math.random() * 15;
      const actual = Math.floor(baseInflow + variation);
      const predicted = Math.floor(actual + (Math.random() - 0.5) * 10);
      
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        actual: actual,
        predicted: predicted,
        upperBound: predicted + 15,
        lowerBound: Math.max(0, predicted - 15)
      });
    }
    
    return data;
  };

  const [chartData, setChartData] = useState(generateDummyData(7));

  useEffect(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    setChartData(generateDummyData(days));
  }, [timeRange]);

  const currentPrediction = chartData[chartData.length - 1];
  const avgInflow = Math.round(
    chartData.reduce((sum, d) => sum + d.actual, 0) / chartData.length
  );
  const trend = currentPrediction.predicted > avgInflow ? "increasing" : "decreasing";

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Predictive Patient Inflow
            </CardTitle>
            <CardDescription className="mt-2">
              Forecasted patient admissions (Dummy Data)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={timeRange === "7d" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeRange("7d")}
            >
              7D
            </Badge>
            <Badge
              variant={timeRange === "30d" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeRange("30d")}
            >
              30D
            </Badge>
            <Badge
              variant={timeRange === "90d" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setTimeRange("90d")}
            >
              90D
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-gray-600">Today's Prediction</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {currentPrediction.predicted}
              </p>
              <p className="text-xs text-gray-600 mt-1">patients</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <p className="text-sm text-gray-600">Average Inflow</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{avgInflow}</p>
              <p className="text-xs text-gray-600 mt-1">patients/day</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <p className="text-sm text-gray-600">Trend</p>
              </div>
              <p className="text-3xl font-bold text-purple-600 capitalize">
                {trend}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {trend === "increasing" ? "↑" : "↓"} {Math.abs(currentPrediction.predicted - avgInflow)} from avg
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  label={{ value: "Patients", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="#f3f4f6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="#ffffff"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorActual)"
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted"
                  dot={{ fill: "#8b5cf6", r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Info Note */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This is dummy data for demonstration. 
              In production, predictions will be based on historical data, 
              pollution levels, festival seasons, and other factors.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictivePatientInflow;

