import React, { useState, useEffect } from "react";
import { Users, Clock, UserCheck, RefreshCw, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { opdAPI } from "@/lib/api";
import socketService from "@/lib/socket";
import { toast } from "sonner";
import AddOPDPatientDialog from "./AddOPDPatientDialog";

const OPDPatientTracking = ({ hospitalId = "default" }) => {
  const [queue, setQueue] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [queueData, stats] = await Promise.all([
        opdAPI.getQueue(hospitalId),
        opdAPI.getStatistics(hospitalId),
      ]);
      setQueue(queueData);
      setStatistics(stats);
    } catch (error) {
      toast.error("Failed to fetch OPD data");
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

    // Listen for OPD queue updates
    const handleQueueUpdate = (data) => {
      setQueue(data.queue || []);
      setStatistics(prev => ({
        ...prev,
        statusStats: [
          { _id: "waiting", count: data.queue.filter(p => p.status === "waiting").length },
          { _id: "consulting", count: data.queue.filter(p => p.status === "consulting").length },
          { _id: "completed", count: (prev.statusStats?.find(s => s._id === "completed")?.count || 0) + 1 }
        ]
      }));
      
      if (data.patient) {
        toast.info(`New patient in queue: ${data.patient.name} (Queue #${data.patient.queueNumber})`);
      } else {
        toast.info(`OPD queue updated: ${data.queueLength} patients waiting`);
      }
    };

    socketService.on("opd:queue:update", handleQueueUpdate);

    // Fallback: Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => {
      socketService.off("opd:queue:update", handleQueueUpdate);
      socketService.leaveHospital(hospitalId);
      clearInterval(interval);
    };
  }, [hospitalId]);

  const statusColors = {
    waiting: "bg-yellow-100 text-yellow-800 border-yellow-300",
    consulting: "bg-blue-100 text-blue-800 border-blue-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };

  const getWaitTime = (registrationTime) => {
    if (!registrationTime) return "N/A";
    const now = new Date();
    const registered = new Date(registrationTime);
    const diff = Math.floor((now - registered) / 1000 / 60); // minutes
    return `${diff} min`;
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
              <Users className="h-6 w-6 text-blue-600" />
              OPD Patient Tracking
            </CardTitle>
            <CardDescription className="mt-2">
              Real-time OPD queue and patient status
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <AddOPDPatientDialog hospitalId={hospitalId} onSuccess={fetchData} />
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200">
            <p className="text-xs text-gray-600 mb-1">Waiting</p>
            <p className="text-xl font-bold text-yellow-600">
              {queue.filter((p) => p.status === "waiting").length}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
            <p className="text-xs text-gray-600 mb-1">Consulting</p>
            <p className="text-xl font-bold text-blue-600">
              {queue.filter((p) => p.status === "consulting").length}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
            <p className="text-xs text-gray-600 mb-1">Completed</p>
            <p className="text-xl font-bold text-green-600">
              {statistics.statusStats?.find((s) => s._id === "completed")?.count || 0}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200">
            <p className="text-xs text-gray-600 mb-1">Total Today</p>
            <p className="text-xl font-bold text-purple-600">
              {queue.length}
            </p>
          </div>
        </div>

        {/* Queue List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg mb-3">Current Queue</h3>
          {queue.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No patients in queue
            </div>
          ) : (
            queue.map((patient) => (
              <div
                key={patient._id}
                className="p-4 border-2 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {patient.queueNumber}
                    </div>
                    <div>
                      <p className="font-semibold">{patient.name}</p>
                      <p className="text-sm text-gray-600">
                        {patient.department} • {patient.age} years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Wait Time</p>
                      <p className="text-sm font-medium">
                        {getWaitTime(patient.registrationTime)}
                      </p>
                    </div>
                    <Badge className={statusColors[patient.status]}>
                      {patient.status}
                    </Badge>
                  </div>
                </div>
                {patient.doctorName && (
                  <p className="text-sm text-gray-600 mt-2">
                    Doctor: {patient.doctorName}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OPDPatientTracking;

