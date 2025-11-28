import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Bell, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const EmergencyAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "critical",
      title: "ICU Bed Shortage",
      message: "Only 2 ICU beds available. Consider patient transfer.",
      time: "2 min ago",
      priority: "high"
    },
    {
      id: 2,
      type: "warning",
      title: "Emergency Department Overload",
      message: "Emergency department at 85% capacity",
      time: "5 min ago",
      priority: "medium"
    },
    {
      id: 3,
      type: "info",
      title: "Ambulance Arrival",
      message: "Ambulance #AMB-123 arriving in 5 minutes",
      time: "8 min ago",
      priority: "low"
    },
    {
      id: 4,
      type: "critical",
      title: "Ventilator Required",
      message: "Patient in Room 204 requires immediate ventilator support",
      time: "10 min ago",
      priority: "high"
    }
  ]);

  const [unreadCount, setUnreadCount] = useState(alerts.length);

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getAlertColor = (type) => {
    const colors = {
      critical: "bg-red-50 border-red-300 text-red-800",
      warning: "bg-orange-50 border-orange-300 text-orange-800",
      info: "bg-blue-50 border-blue-300 text-blue-800"
    };
    return colors[type] || colors.info;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: <Badge className="bg-red-500 text-white">High</Badge>,
      medium: <Badge className="bg-orange-500 text-white">Medium</Badge>,
      low: <Badge className="bg-blue-500 text-white">Low</Badge>
    };
    return badges[priority] || badges.low;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-red-600" />
            <CardTitle className="text-xl">Emergency Alerts</CardTitle>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </div>
        <CardDescription>
          Critical notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No active alerts</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-2 ${getAlertColor(alert.type)} relative group`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        {getPriorityBadge(alert.priority)}
                      </div>
                      <p className="text-xs opacity-90 mb-2">{alert.message}</p>
                      <p className="text-xs opacity-75">{alert.time}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyAlerts;

