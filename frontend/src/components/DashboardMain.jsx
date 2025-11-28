import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  Bed,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BedOccupancyDashboard from "./dashboard/BedOccupancyDashboard";
import BedOccupancyOverview from "./dashboard/BedOccupancyOverview";
import DepartmentAvailability from "./dashboard/DepartmentAvailability";
import DoctorAvailabilityTable from "./dashboard/DoctorAvailabilityTable";
import DoctorShiftManagement from "./dashboard/DoctorShiftManagement";
import LiveOPDCounter from "./dashboard/LiveOPDCounter";
import OPDPatientTracking from "./dashboard/OPDPatientTracking";
import EmergencyCaseLogging from "./dashboard/EmergencyCaseLogging";
import EmergencyAlerts from "./dashboard/EmergencyAlerts";
import PollutionIndexWidget from "./dashboard/PollutionIndexWidget";
import PredictivePatientInflow from "./dashboard/PredictivePatientInflow";
import PredictionDashboard from "./dashboard/PredictionDashboard";
import socketService from "@/lib/socket";
import SocketStatus from "./dashboard/SocketStatus";

function DashboardMain() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [hospitalId] = useState("default"); // In production, get from auth context

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Initialize Socket.io connection when dashboard loads
    socketService.connect();
    socketService.joinHospital(hospitalId);
    
    return () => {
      clearInterval(timer);
      socketService.leaveHospital(hospitalId);
    };
  }, [hospitalId]);

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "beds", label: "Bed Occupancy", icon: Bed },
    { id: "shifts", label: "Doctor Shifts", icon: Clock },
    { id: "opd", label: "OPD Tracking", icon: Users },
    { id: "emergency", label: "Emergency", icon: AlertTriangle },
    { id: "predictions", label: "Predictions", icon: TrendingUp },
  ];

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
                  Aस्पताल Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-gray-600">
                {currentTime.toLocaleTimeString()}
              </div>
              <SocketStatus />
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
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-lg lg:shadow-none transition-transform duration-300`}
        >
          <div className="h-full overflow-y-auto p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Hospital Management Dashboard
                </h1>
                <p className="text-gray-600">
                  Real-time monitoring and resource management
                </p>
              </div>

              {/* Top Row - Bed Occupancy & Department Availability */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BedOccupancyOverview />
                <DepartmentAvailability />
              </div>

              {/* Second Row - Doctor Table & Sidebar Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DoctorAvailabilityTable />
                </div>
                <div className="space-y-6">
                  <LiveOPDCounter />
                  <EmergencyAlerts />
                  <PollutionIndexWidget />
                </div>
              </div>

              {/* Third Row - Predictive Graph */}
              <div>
                <PredictivePatientInflow />
              </div>
            </div>
          )}

          {activeTab === "beds" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bed Occupancy Management
                </h1>
                <p className="text-gray-600">Real-time bed availability tracking</p>
              </div>
              <BedOccupancyDashboard hospitalId={hospitalId} />
            </div>
          )}

          {activeTab === "shifts" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Doctor Shift Management
                </h1>
                <p className="text-gray-600">Manage and monitor doctor schedules</p>
              </div>
              <DoctorShiftManagement hospitalId={hospitalId} />
            </div>
          )}

          {activeTab === "opd" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  OPD Patient Tracking
                </h1>
                <p className="text-gray-600">Monitor OPD queue and patient status</p>
              </div>
              <OPDPatientTracking hospitalId={hospitalId} />
            </div>
          )}

          {activeTab === "emergency" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Emergency Case Logging
                </h1>
                <p className="text-gray-600">Track and manage emergency cases</p>
              </div>
              <EmergencyCaseLogging hospitalId={hospitalId} />
            </div>
          )}

          {activeTab === "predictions" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Surge Predictions
                </h1>
                <p className="text-gray-600">
                  Pollution spikes and festival season surge predictions
                </p>
              </div>
              <PredictionDashboard hospitalId={hospitalId} />
            </div>
          )}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default DashboardMain;

