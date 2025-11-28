import React from "react";
import { User, Clock, Stethoscope } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DoctorAvailabilityTable = () => {
  // Placeholder data
  const doctors = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      specialty: "Cardiology",
      shift: "Morning",
      timing: "08:00 - 16:00",
      status: "available",
      patients: 12
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      specialty: "Pediatrics",
      shift: "Morning",
      timing: "08:00 - 16:00",
      status: "busy",
      patients: 25
    },
    {
      id: 3,
      name: "Dr. Amit Patel",
      specialty: "Orthopedics",
      shift: "Evening",
      timing: "16:00 - 00:00",
      status: "available",
      patients: 8
    },
    {
      id: 4,
      name: "Dr. Sneha Desai",
      specialty: "Neurology",
      shift: "Night",
      timing: "00:00 - 08:00",
      status: "available",
      patients: 5
    },
    {
      id: 5,
      name: "Dr. Vikram Singh",
      specialty: "Emergency Medicine",
      shift: "Morning",
      timing: "08:00 - 16:00",
      status: "busy",
      patients: 18
    },
    {
      id: 6,
      name: "Dr. Anjali Mehta",
      specialty: "General Medicine",
      shift: "Evening",
      timing: "16:00 - 00:00",
      status: "available",
      patients: 15
    }
  ];

  const getStatusBadge = (status) => {
    if (status === "available") {
      return <Badge className="bg-green-500 text-white">Available</Badge>;
    }
    return <Badge className="bg-orange-500 text-white">Busy</Badge>;
  };

  const getShiftColor = (shift) => {
    const colors = {
      Morning: "bg-blue-100 text-blue-700",
      Evening: "bg-purple-100 text-purple-700",
      Night: "bg-indigo-100 text-indigo-700"
    };
    return colors[shift] || colors.Morning;
  };

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
                <tr key={doctor.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{doctor.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{doctor.specialty}</td>
                  <td className="p-3">
                    <Badge className={getShiftColor(doctor.shift)}>
                      {doctor.shift}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{doctor.timing}</span>
                    </div>
                  </td>
                  <td className="p-3">{getStatusBadge(doctor.status)}</td>
                  <td className="p-3">
                    <span className="font-semibold text-gray-700">{doctor.patients}</span>
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

