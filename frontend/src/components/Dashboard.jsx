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
import SocketStatus from "./dashboard/SocketStatus";
import socketService from "@/lib/socket";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hospitalId] = useState("default"); // TODO: Get from auth context/user session
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [dashboardData, setDashboardData] = useState(null); // Add this state
  const [loading, setLoading] = useState(true); // Add this state

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/${hospitalId}/overview`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // If using auth
          }
        });
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

  // Initialize Socket.io connection for real-time updates
  useEffect(() => {
    // Connect to socket server
    socketService.connect();
    socketService.joinHospital(hospitalId);

    // Listen for various real-time events
    const handleBedUpdate = (data) => {
      toast.info("Bed occupancy updated");
      setNotifications(prev => [...prev, { type: "bed", message: "Bed data updated", time: new Date() }]);
    };

    const handleEmergency = (data) => {
      toast.error(`🚨 Emergency: ${data.patientName || "New case"}`);
      setNotifications(prev => [...prev, { type: "emergency", message: `Emergency: ${data.patientName}`, time: new Date() }]);
    };

    const handleDoctorShift = (data) => {
      toast.info(`👨‍⚕️ Dr. ${data.name} ${data.action}`);
      setNotifications(prev => [...prev, { type: "doctor", message: `Dr. ${data.name} ${data.action}`, time: new Date() }]);
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
      setNotifications(prev => [...prev, { type: "alert", message: data.title, time: new Date() }]);
    };

    // Subscribe to socket events
    socketService.on("bed:occupancy:update", handleBedUpdate);
    socketService.on("emergency:new", handleEmergency);
    socketService.on("emergency:critical", handleEmergency);
    socketService.on("doctor:shift:change", handleDoctorShift);
    socketService.on("opd:queue:update", handleOPDUpdate);
    socketService.on("alert:new", handleAlert);

    // Cleanup on unmount
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
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
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
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Hospital Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Socket Status Indicator */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Header with real stats */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Hospital Management Dashboard
              </h1>
              <p className="text-gray-600">
                Real-time monitoring • Last updated: {dashboardData?.timestamp ? new Date(dashboardData.timestamp).toLocaleTimeString() : ''}
              </p>
            </div>

            {/* Dashboard Grid - Now with real data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <BedOccupancyOverview hospitalId={hospitalId} data={dashboardData?.beds} />
                <DepartmentAvailability hospitalId={hospitalId} data={dashboardData?.doctors} />
                <DoctorAvailabilityTable hospitalId={hospitalId} />
                <PredictivePatientInflow hospitalId={hospitalId} />
              </div>

              <div className="space-y-6">
                <LiveOPDCounter hospitalId={hospitalId} data={dashboardData?.opd} />
                <EmergencyAlerts hospitalId={hospitalId} alerts={dashboardData?.alerts} />
                <PollutionIndexWidget hospitalId={hospitalId} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;