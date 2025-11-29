import React, { useState, useEffect } from "react";
import { Users, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { opdAPI } from "@/lib/api";
import { toast } from "sonner";

const LiveOPDCounter = ({ hospitalId = "default" }) => {
  const [waitingPatients, setWaitingPatients] = useState(0);
  const [avgWaitTime, setAvgWaitTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const calculateAverageWait = (queue) => {
    if (!queue.length) return 0;
    const now = Date.now();
    const totalMinutes = queue.reduce((sum, patient) => {
      const registered = patient.registrationTime ? new Date(patient.registrationTime).getTime() : now;
      const diff = Math.max(0, now - registered);
      return sum + diff / 1000 / 60;
    }, 0);
    return Math.round(totalMinutes / queue.length);
  };

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const queue = await opdAPI.getQueue(hospitalId);
        const waiting = queue.filter((patient) => patient.status === "waiting");
        setWaitingPatients(waiting.length);
        setAvgWaitTime(calculateAverageWait(waiting));
      } catch (error) {
        console.error(error);
        toast.error("Failed to load OPD queue");
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [hospitalId]);

  const getWaitTimeColor = (time) => {
    if (time > 30) return "text-red-600";
    if (time > 20) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Live OPD Counter
        </CardTitle>
        <CardDescription>
          Real-time patient waiting status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Counter */}
          <div className="text-center p-6 bg-white rounded-lg border-2 border-blue-200">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {loading ? "—" : waitingPatients}
            </div>
            <p className="text-gray-600 font-medium">Patients Waiting</p>
          </div>

          {/* Average Wait Time */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">Avg. Wait Time</span>
              </div>
              <span className={`text-2xl font-bold ${getWaitTimeColor(avgWaitTime)}`}>
                {loading ? "—" : `${avgWaitTime} min`}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              className={
                waitingPatients > 40 
                  ? "bg-red-500 text-white" 
                  : waitingPatients > 30 
                  ? "bg-orange-500 text-white" 
                  : "bg-green-500 text-white"
              }
            >
              {waitingPatients > 40 ? "High Load" : waitingPatients > 30 ? "Moderate" : "Normal"}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOPDCounter;

