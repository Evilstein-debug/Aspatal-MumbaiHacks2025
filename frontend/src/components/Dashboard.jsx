import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Menu, 
  X, 
  Bell,
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BedOccupancyOverview from "./dashboard/BedOccupancyOverview";
import DepartmentAvailability from "./dashboard/DepartmentAvailability";
import DoctorAvailabilityTable from "./dashboard/DoctorAvailabilityTable";
import LiveOPDCounter from "./dashboard/LiveOPDCounter";
import EmergencyAlerts from "./dashboard/EmergencyAlerts";
import PollutionIndexWidget from "./dashboard/PollutionIndexWidget";
import PredictivePatientInflow from "./dashboard/PredictivePatientInflow";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Hospital Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-gray-600">
                {currentTime.toLocaleTimeString()}
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hospital Management Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time monitoring and resource management
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bed Occupancy Overview */}
            <BedOccupancyOverview />

            {/* Department Availability */}
            <DepartmentAvailability />

            {/* Doctor Availability Table */}
            <DoctorAvailabilityTable />

            {/* Predictive Patient Inflow */}
            <PredictivePatientInflow />
          </div>

          {/* Right Column - Sidebar Metrics */}
          <div className="space-y-6">
            {/* Live OPD Counter */}
            <LiveOPDCounter />

            {/* Emergency Alerts */}
            <EmergencyAlerts />

            {/* Pollution Index Widget */}
            <PollutionIndexWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

