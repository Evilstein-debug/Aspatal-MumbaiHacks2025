import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Bell, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alertAPI } from "@/lib/api";
import { toast } from "sonner";

const EmergencyAlerts = ({ hospitalId = "default" }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertAPI.getActiveAlerts(hospitalId);
      setAlerts(response?.data || response || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [hospitalId]);

  const dismissAlert = async (id) => {
    setAlerts((prev) => prev.filter((alert) => alert._id !== id));
  };

  const getAlertColor = (severity) => {
    const colors = {
      critical: "bg-red-50 border-red-300 text-red-800",
      high: "bg-red-50 border-red-300 text-red-800",
      medium: "bg-orange-50 border-orange-300 text-orange-800",
      low: "bg-blue-50 border-blue-300 text-blue-800"
    };
    return colors[severity] || colors.low;
  };

  const getPriorityBadge = (severity) => {
    const labels = {
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low"
    };
    const colors = {
      critical: "bg-red-500 text-white",
      high: "bg-red-500 text-white",
      medium: "bg-orange-500 text-white",
      low: "bg-blue-500 text-white"
    };
    return <Badge className={colors[severity] || colors.low}>{labels[severity] || "Low"}</Badge>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-red-600" />
            <CardTitle className="text-xl">Emergency Alerts</CardTitle>
          </div>
          {alerts.length > 0 && (
            <Badge className="bg-red-500 text-white">
              {alerts.length}
            </Badge>
          )}
        </div>
        <CardDescription>
          Critical notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No active alerts</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-4 rounded-lg border-2 ${getAlertColor(alert.severity)} relative group`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        {getPriorityBadge(alert.severity)}
                      </div>
                      <p className="text-xs opacity-90 mb-2">{alert.message}</p>
                      <p className="text-xs opacity-75">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => dismissAlert(alert._id)}
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

