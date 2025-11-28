import React from "react";
import { Activity, Stethoscope, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DepartmentAvailability = () => {
  // Placeholder data
  const departments = [
    {
      name: "ICU",
      icon: Activity,
      total: 30,
      occupied: 28,
      available: 2,
      color: "red",
      critical: true
    },
    {
      name: "General Ward",
      icon: Stethoscope,
      total: 120,
      occupied: 85,
      available: 35,
      color: "green",
      critical: false
    },
    {
      name: "Emergency",
      icon: AlertCircle,
      total: 50,
      occupied: 32,
      available: 18,
      color: "orange",
      critical: false
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      red: "bg-red-100 text-red-700 border-red-300",
      green: "bg-green-100 text-green-700 border-green-300",
      orange: "bg-orange-100 text-orange-700 border-orange-300"
    };
    return colors[color] || colors.green;
  };

  const getProgressColor = (occupied, total) => {
    const percentage = (occupied / total) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl">Department-wise Availability</CardTitle>
        <CardDescription>
          Real-time bed availability across departments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((dept, index) => {
            const Icon = dept.icon;
            const occupancyRate = ((dept.occupied / dept.total) * 100).toFixed(1);
            const progressColor = getProgressColor(dept.occupied, dept.total);

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getColorClasses(dept.color)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">{dept.name}</h3>
                  </div>
                  {dept.critical && (
                    <Badge variant="destructive" className="text-xs">
                      Critical
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Available: {dept.available}</span>
                    <span className="font-semibold">{occupancyRate}% Occupied</span>
                  </div>
                  <Progress 
                    value={occupancyRate} 
                    className="h-2"
                    color={dept.occupied / dept.total > 0.9 ? "red" : dept.occupied / dept.total > 0.7 ? "orange" : "green"}
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Occupied: {dept.occupied}</span>
                    <span>Total: {dept.total}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentAvailability;

