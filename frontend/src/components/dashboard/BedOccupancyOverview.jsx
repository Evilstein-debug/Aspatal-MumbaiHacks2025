import React from "react";
import { Bed, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = {
  occupied: "#ef4444",
  vacant: "#10b981"
};

const BedOccupancyOverview = () => {
  // Placeholder data
  const bedData = [
    { name: "Occupied", value: 145, color: COLORS.occupied },
    { name: "Vacant", value: 55, color: COLORS.vacant }
  ];

  const totalBeds = bedData.reduce((sum, item) => sum + item.value, 0);
  const occupancyRate = ((bedData[0].value / totalBeds) * 100).toFixed(1);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Bed className="h-6 w-6 text-blue-600" />
              Bed Occupancy Overview
            </CardTitle>
            <CardDescription className="mt-2">
              Current bed status across all departments
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupied Beds</p>
                  <p className="text-3xl font-bold text-red-600">{bedData[0].value}</p>
                </div>
                <Users className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vacant Beds</p>
                  <p className="text-3xl font-bold text-green-600">{bedData[1].value}</p>
                </div>
                <Bed className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Beds</p>
                  <p className="text-3xl font-bold text-blue-600">{totalBeds}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{occupancyRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BedOccupancyOverview;

