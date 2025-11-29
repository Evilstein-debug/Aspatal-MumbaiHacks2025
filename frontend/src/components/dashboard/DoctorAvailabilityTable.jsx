import React, { useEffect, useState } from "react";
import { User, Clock, Stethoscope } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { doctorAPI } from "@/lib/api";
import { toast } from "sonner";

const SHIFT_COLORS = {
  morning: "bg-blue-100 text-blue-700",
  evening: "bg-purple-100 text-purple-700",
  night: "bg-indigo-100 text-indigo-700",
  off: "bg-gray-100 text-gray-700"
};

const STATUS_BADGES = {
  active: "bg-green-500 text-white",
  "on-duty": "bg-green-500 text-white",
  "off-duty": "bg-gray-500 text-white",
  "on-leave": "bg-yellow-500 text-white",
  suspended: "bg-red-500 text-white"
};

const DoctorAvailabilityTable = ({ hospitalId = "default", refreshKey = 0 }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await doctorAPI.getDoctors(hospitalId);
        const data = response?.data || response?.doctors || [];
        setDoctors(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [hospitalId, refreshKey]);

  const getStatusBadge = (status) => {
    const variant = STATUS_BADGES[status] || STATUS_BADGES.active;
    return <Badge className={variant}>{status?.replace("-", " ") || "active"}</Badge>;
  };

  const getShiftBadge = (shift) => {
    const label = shift
      ? `${shift.charAt(0).toUpperCase()}${shift.slice(1)}`
      : "Not Assigned";
    return (
      <Badge className={SHIFT_COLORS[shift] || SHIFT_COLORS.off}>
        {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            Doctor Availability
          </CardTitle>
          <CardDescription>Current doctor status and shift timings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-10">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!doctors.length) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            Doctor Availability
          </CardTitle>
          <CardDescription>Current doctor status and shift timings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-10">No doctors found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-blue-600" />
          Doctor Availability
        </CardTitle>
        <CardDescription>
          Current doctor status and shift timings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Specialty</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Shift</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Timing</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Patients</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{doctor.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{doctor.specialization || doctor.department || "—"}</td>
                  <td className="p-3">{getShiftBadge(doctor.currentShift)}</td>
                  <td className="p-3">
                    {doctor.shiftTimings?.morning?.startTime ? (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {doctor.shiftTimings?.morning?.startTime} -{" "}
                          {doctor.shiftTimings?.morning?.endTime}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Scheduled per shift</span>
                    )}
                  </td>
                  <td className="p-3">{getStatusBadge(doctor.status)}</td>
                  <td className="p-3">
                    <span className="font-semibold text-gray-700">
                      {doctor.currentPatientCount ?? "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorAvailabilityTable;

