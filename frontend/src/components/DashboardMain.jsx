import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  RefreshCw,
  ArrowRightLeft,
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
import PatientTransferDashboard from "./dashboard/PatientTransferDashboard";
import SocketStatus from "./dashboard/SocketStatus";
import socketService from "@/lib/socket";
import { toast } from "sonner";

function DashboardMain() {
  const { hospitalId: routeHospitalId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [hospitalId] = useState(routeHospitalId || "default");
  const [notifications, setNotifications] = useState([]);
  const [doctorRefreshKey, setDoctorRefreshKey] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard overview data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/${hospitalId}/overview`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, [hospitalId]);

  // Socket.io connection for real-time updates
  useEffect(() => {
    socketService.connect();
    socketService.joinHospital(hospitalId);

    // Socket event handlers
    const handleBedUpdate = (data) => {
      toast.info("Bed occupancy updated");
      setNotifications((prev) => [
        ...prev,
        { type: "bed", message: "Bed data updated", time: new Date() },
      ]);
    };

    const handleEmergency = (data) => {
      toast.error(`🚨 Emergency: ${data.patientName || "New case"}`);
      setNotifications((prev) => [
        ...prev,
        { type: "emergency", message: `Emergency: ${data.patientName}`, time: new Date() },
      ]);
    };

    const handleDoctorShift = (data) => {
      toast.info(`👨‍⚕️ Dr. ${data.name} ${data.action}`);
      setNotifications((prev) => [
        ...prev,
        { type: "doctor", message: `Dr. ${data.name} ${data.action}`, time: new Date() },
      ]);
    };

    const handleOPDUpdate = (data) => {
      toast.info(`OPD queue updated: ${data.queueLength} patients`);
    };

    const handleAlert = (data) => {
      if (data.severity === "critical" || data.severity === "high") {
        toast.error(`⚠️ ${data.title}: ${data.message}`);
      } else {
        toast.info(`${data.title}: ${data.message}`);
      }
      setNotifications((prev) => [
        ...prev,
        { type: "alert", message: data.title, time: new Date() },
      ]);
    };

    // Subscribe to socket events
    socketService.on("bed:occupancy:update", handleBedUpdate);
    socketService.on("emergency:new", handleEmergency);
    socketService.on("emergency:critical", handleEmergency);
    socketService.on("doctor:shift:change", handleDoctorShift);
    socketService.on("opd:queue:update", handleOPDUpdate);
    socketService.on("alert:new", handleAlert);

    return () => {
      socketService.off("bed:occupancy:update", handleBedUpdate);
      socketService.off("emergency:new", handleEmergency);
      socketService.off("emergency:critical", handleEmergency);
      socketService.off("doctor:shift:change", handleDoctorShift);
      socketService.off("opd:queue:update", handleOPDUpdate);
      socketService.off("alert:new", handleAlert);
      socketService.leaveHospital(hospitalId);
    };
  }, [hospitalId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "beds", label: "Bed Occupancy", icon: Bed },
    { id: "shifts", label: "Doctor Shifts", icon: Clock },
    { id: "opd", label: "OPD Tracking", icon: Users },
    { id: "emergency", label: "Emergency", icon: AlertTriangle },
    { id: "transfers", label: "Transfers", icon: ArrowRightLeft },
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
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => navigate("/")}
              >
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Aस्पताल Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SocketStatus />
              <div className="hidden sm:block text-sm text-gray-600">
                {currentTime.toLocaleTimeString()}
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed lg:relative lg:translate-x-0 inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-lg transition-transform duration-300 ease-in-out lg:block mt-16 lg:mt-0`}
        >
          <nav className="h-full overflow-y-auto py-6 px-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {loading && activeTab === "overview" ? (
            <div className="flex items-center justify-center h-96">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Overview Tab - Enhanced with API data */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Hospital Management Dashboard
                    </h1>
                    <p className="text-gray-600">
                      Real-time monitoring • Last updated:{" "}
                      {dashboardData?.timestamp
                        ? new Date(dashboardData.timestamp).toLocaleTimeString()
                        : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Metrics */}
                    <div className="lg:col-span-2 space-y-6">
                      <BedOccupancyOverview
                        hospitalId={hospitalId}
                        data={dashboardData?.beds}
                      />
                      <DepartmentAvailability
                        hospitalId={hospitalId}
                        data={dashboardData?.doctors}
                      />
                      <DoctorAvailabilityTable
                        hospitalId={hospitalId}
                        refreshKey={doctorRefreshKey}
                      />
                      <PredictivePatientInflow hospitalId={hospitalId} />
                    </div>

                    {/* Right Column - Sidebar Metrics */}
                    <div className="space-y-6">
                      <LiveOPDCounter
                        hospitalId={hospitalId}
                        data={dashboardData?.opd}
                      />
                      <EmergencyAlerts
                        hospitalId={hospitalId}
                        alerts={dashboardData?.alerts}
                      />
                      <PollutionIndexWidget hospitalId={hospitalId} />
                    </div>
                  </div>
                </div>
              )}

              {/* Bed Occupancy Tab */}
              {activeTab === "beds" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Bed Occupancy Management
                  </h2>
                  <BedOccupancyDashboard hospitalId={hospitalId} />
                </div>
              )}

              {/* Doctor Shifts Tab */}
              {activeTab === "shifts" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Doctor Shift Management
                  </h2>
                  <DoctorShiftManagement
                    hospitalId={hospitalId}
                    onDoctorAdded={() => setDoctorRefreshKey((prev) => prev + 1)}
                  />
                </div>
              )}

              {/* OPD Tracking Tab */}
              {activeTab === "opd" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    OPD Patient Tracking
                  </h2>
                  <OPDPatientTracking hospitalId={hospitalId} />
                </div>
              )}

              {/* Emergency Tab */}
              {activeTab === "emergency" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Emergency Case Management
                  </h2>
                  <EmergencyCaseLogging hospitalId={hospitalId} />
                </div>
              )}

              {/* Transfers Tab */}
              {activeTab === "transfers" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Patient Transfer Management
                  </h2>
                  <PatientTransferDashboard hospitalId={hospitalId} />
                </div>
              )}

              {/* Predictions Tab */}
              {activeTab === "predictions" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Predictive Analytics
                  </h2>
                  <PredictionDashboard hospitalId={hospitalId} />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardMain;