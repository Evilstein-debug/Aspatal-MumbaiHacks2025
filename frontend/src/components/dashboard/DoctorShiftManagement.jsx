import React, { useState, useEffect } from "react";
import { Clock, User, Calendar, Plus, RefreshCw, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shiftAPI } from "@/lib/api";
import socketService from "@/lib/socket";
import { toast } from "sonner";
import AddShiftDialog from "./AddShiftDialog";
import AddDoctorDialog from "./AddDoctorDialog";

const DoctorShiftManagement = ({ hospitalId = "default", onDoctorAdded }) => {
  const [shifts, setShifts] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const [allShifts, active] = await Promise.all([
        shiftAPI.getShifts(hospitalId, { date: selectedDate }),
        shiftAPI.getActiveShifts(hospitalId),
      ]);
      setShifts(allShifts);
      setActiveShifts(active);
    } catch (error) {
      toast.error("Failed to fetch shift data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
    
    // Set up Socket.io connection
    socketService.connect();
    socketService.joinHospital(hospitalId);

    // Listen for doctor shift changes
    const handleShiftChange = (data) => {
      setShifts(prev => {
        const updated = prev.map(shift => 
          shift.doctorId?._id === data.doctorId ? { ...shift, ...data } : shift
        );
        return updated;
      });

      if (data.action === "login") {
        toast.success(`👨‍⚕️ Dr. ${data.name} logged in (${data.currentShift} shift)`);
      } else if (data.action === "logout") {
        toast.info(`👨‍⚕️ Dr. ${data.name} logged out`);
      } else {
        toast.info(`👨‍⚕️ Dr. ${data.name} shift changed to ${data.currentShift}`);
      }
    };

    socketService.on("doctor:shift:change", handleShiftChange);

    // Fallback: Refresh every minute
    const interval = setInterval(fetchShifts, 60000);

    return () => {
      socketService.off("doctor:shift:change", handleShiftChange);
      socketService.leaveHospital(hospitalId);
      clearInterval(interval);
    };
  }, [hospitalId, selectedDate]);

  const shiftColors = {
    morning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    evening: "bg-orange-100 text-orange-800 border-orange-300",
    night: "bg-blue-100 text-blue-800 border-blue-300",
  };

  const statusColors = {
    scheduled: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-600" />
              Doctor Shift Management
            </CardTitle>
            <CardDescription className="mt-2">
              Manage and monitor doctor shifts
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <AddDoctorDialog
              hospitalId={hospitalId}
              onSuccess={() => {
                fetchShifts();
                if (onDoctorAdded) onDoctorAdded();
              }}
            />
            <AddShiftDialog hospitalId={hospitalId} onSuccess={fetchShifts} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <Button variant="outline" size="sm" onClick={fetchShifts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Active Shifts Summary */}
        {activeShifts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Currently Active Shifts ({activeShifts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeShifts.map((shift) => (
                <div
                  key={shift._id}
                  className="p-3 bg-green-50 border-2 border-green-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{shift.doctorName}</span>
                    <Badge className={shiftColors[shift.shiftType]}>
                      {shift.shiftType}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{shift.specialization}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {shift.startTime} - {shift.endTime}
                  </p>
                  <p className="text-xs text-gray-500">
                    Patients: {shift.currentPatientCount}/{shift.maxPatientCapacity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Shifts Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Doctor</th>
                <th className="text-left p-2">Specialization</th>
                <th className="text-left p-2">Shift</th>
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Patients</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift._id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{shift.doctorName}</td>
                  <td className="p-2 text-sm text-gray-600">{shift.specialization}</td>
                  <td className="p-2">
                    <Badge className={shiftColors[shift.shiftType]}>
                      {shift.shiftType}
                    </Badge>
                  </td>
                  <td className="p-2 text-sm">
                    {shift.startTime} - {shift.endTime}
                  </td>
                  <td className="p-2">
                    <Badge className={statusColors[shift.status]}>
                      {shift.status}
                    </Badge>
                  </td>
                  <td className="p-2 text-sm">
                    {shift.currentPatientCount}/{shift.maxPatientCapacity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shifts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No shifts scheduled for this date
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorShiftManagement;

