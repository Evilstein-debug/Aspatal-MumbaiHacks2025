import React, { useState, useEffect } from "react";
import { AlertTriangle, Activity, RefreshCw, Plus, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { emergencyAPI } from "@/lib/api";
import socketService from "@/lib/socket";
import { toast } from "sonner";

const EmergencyCaseLogging = ({ hospitalId = "default" }) => {
  const [cases, setCases] = useState([]);
  const [criticalCases, setCriticalCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allCases, critical] = await Promise.all([
        emergencyAPI.getCases(hospitalId, { date: new Date().toISOString().split("T")[0] }),
        emergencyAPI.getCriticalCases(hospitalId),
      ]);
      setCases(allCases);
      setCriticalCases(critical);
    } catch (error) {
      toast.error("Failed to fetch emergency data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up Socket.io connection
    socketService.connect();
    socketService.joinHospital(hospitalId);

    // Listen for new emergency cases
    const handleNewEmergency = (data) => {
      setCases(prev => [data, ...prev]);
      if (data.triageLevel === "critical") {
        setCriticalCases(prev => [data, ...prev]);
        toast.error(`🚨 Critical emergency case: ${data.patientName}`);
      } else {
        toast.info(`New emergency case: ${data.patientName}`);
      }
    };

    // Listen for critical cases
    const handleCriticalEmergency = (data) => {
      setCriticalCases(prev => {
        if (!prev.find(c => c._id === data._id)) {
          return [data, ...prev];
        }
        return prev;
      });
      toast.error(`🚨 CRITICAL: ${data.patientName} - ${data.chiefComplaint}`);
    };

    socketService.on("emergency:new", handleNewEmergency);
    socketService.on("emergency:critical", handleCriticalEmergency);

    // Fallback: Refresh every 20 seconds
    const interval = setInterval(fetchData, 20000);

    return () => {
      socketService.off("emergency:new", handleNewEmergency);
      socketService.off("emergency:critical", handleCriticalEmergency);
      socketService.leaveHospital(hospitalId);
      clearInterval(interval);
    };
  }, [hospitalId]);

  const triageColors = {
    critical: "bg-red-100 text-red-800 border-red-300",
    urgent: "bg-orange-100 text-orange-800 border-orange-300",
    moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
    minor: "bg-green-100 text-green-800 border-green-300",
  };

  const statusColors = {
    arrived: "bg-blue-100 text-blue-800",
    triage: "bg-purple-100 text-purple-800",
    treatment: "bg-yellow-100 text-yellow-800",
    admitted: "bg-green-100 text-green-800",
    discharged: "bg-gray-100 text-gray-800",
    transferred: "bg-indigo-100 text-indigo-800",
  };

  const getTimeElapsed = (arrivalTime) => {
    if (!arrivalTime) return "N/A";
    const now = new Date();
    const arrived = new Date(arrivalTime);
    const diff = Math.floor((now - arrived) / 1000 / 60); // minutes
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
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
              <AlertTriangle className="h-6 w-6 text-red-600" />
              Emergency Case Logging
            </CardTitle>
            <CardDescription className="mt-2">
              Real-time emergency cases and critical alerts
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Critical Cases Alert */}
        {criticalCases.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">
                Critical Cases ({criticalCases.length})
              </h3>
            </div>
            <div className="space-y-2">
              {criticalCases.slice(0, 3).map((case_) => (
                <div
                  key={case_._id}
                  className="p-2 bg-white rounded border border-red-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{case_.patientName}</p>
                      <p className="text-sm text-gray-600">{case_.chiefComplaint}</p>
                    </div>
                    <Badge className={statusColors[case_.status]}>
                      {case_.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Cases */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Today's Emergency Cases</h3>
          {cases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No emergency cases today
            </div>
          ) : (
            cases.map((case_) => (
              <div
                key={case_._id}
                className={`p-4 border-2 rounded-lg ${
                  case_.triageLevel === "critical"
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-white"
                } hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{case_.patientName}</h4>
                      <Badge className={triageColors[case_.triageLevel]}>
                        {case_.triageLevel}
                      </Badge>
                      <Badge className={statusColors[case_.status]}>
                        {case_.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {case_.chiefComplaint}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Age: {case_.age} years</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeElapsed(case_.arrivalTime)}
                      </span>
                    </div>
                    {case_.assignedDoctorName && (
                      <p className="text-sm text-gray-600 mt-1">
                        Doctor: {case_.assignedDoctorName}
                      </p>
                    )}
                  </div>
                </div>
                {case_.vitalSigns && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {case_.vitalSigns.bloodPressure && (
                        <div>
                          <span className="text-gray-600">BP: </span>
                          <span className="font-medium">
                            {case_.vitalSigns.bloodPressure}
                          </span>
                        </div>
                      )}
                      {case_.vitalSigns.heartRate && (
                        <div>
                          <span className="text-gray-600">HR: </span>
                          <span className="font-medium">
                            {case_.vitalSigns.heartRate} bpm
                          </span>
                        </div>
                      )}
                      {case_.vitalSigns.temperature && (
                        <div>
                          <span className="text-gray-600">Temp: </span>
                          <span className="font-medium">
                            {case_.vitalSigns.temperature}°C
                          </span>
                        </div>
                      )}
                      {case_.vitalSigns.oxygenSaturation && (
                        <div>
                          <span className="text-gray-600">SpO2: </span>
                          <span className="font-medium">
                            {case_.vitalSigns.oxygenSaturation}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyCaseLogging;

