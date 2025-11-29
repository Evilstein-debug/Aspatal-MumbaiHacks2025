import React, { useState, useEffect } from "react";
import { Bed, Plus, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bedAPI, bedItemAPI } from "@/lib/api";
import socketService from "@/lib/socket";
import { toast } from "sonner";
import AddBedDialog from "./AddBedDialog";

const BedOccupancyDashboard = ({ hospitalId = "default" }) => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [bedItems, setBedItems] = useState([]);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const [occupancyData, bedItemsResponse] = await Promise.all([
        bedAPI.getRealTime(hospitalId),
        bedItemAPI.getAllBeds(hospitalId)
      ]);
      setBeds(occupancyData.beds || []);
      setSummary(occupancyData.summary || {});
      const items = bedItemsResponse?.data || bedItemsResponse?.beds || bedItemsResponse || [];
      setBedItems(Array.isArray(items) ? items : items.data || []);
    } catch (error) {
      toast.error("Failed to fetch bed occupancy data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();
    
    // Set up Socket.io connection
    socketService.connect();
    socketService.joinHospital(hospitalId);

    // Listen for real-time bed occupancy updates
    const handleBedUpdate = (data) => {
      setBeds(prevBeds => {
        const updated = prevBeds.map(bed => 
          bed._id === data._id ? data : bed
        );
        // If new bed type, add it
        if (!updated.find(b => b._id === data._id)) {
          updated.push(data);
        }
        return updated;
      });
      
      // Update summary
      setSummary(prev => ({
        totalBeds: (prev.totalBeds || 0) + (data.totalBeds - (prev.totalBeds || 0)),
        occupiedBeds: (prev.occupiedBeds || 0) + (data.occupiedBeds - (prev.occupiedBeds || 0)),
        availableBeds: (prev.availableBeds || 0) + (data.availableBeds - (prev.availableBeds || 0))
      }));
      
      toast.info("Bed occupancy updated in real-time");
    };

    socketService.on("bed:occupancy:update", handleBedUpdate);

    // Fallback: Refresh every 30 seconds
    const interval = setInterval(fetchBeds, 30000);

    return () => {
      socketService.off("bed:occupancy:update", handleBedUpdate);
      socketService.leaveHospital(hospitalId);
      clearInterval(interval);
    };
  }, [hospitalId]);

  const bedTypes = {
    general: { label: "General", color: "bg-blue-500" },
    icu: { label: "ICU", color: "bg-red-500" },
    ventilator: { label: "Ventilator", color: "bg-purple-500" },
    isolation: { label: "Isolation", color: "bg-yellow-500" },
  };

  const getUtilizationRate = (bed) => {
    if (!bed.totalBeds) return 0;
    return ((bed.occupiedBeds / bed.totalBeds) * 100).toFixed(1);
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
              <Bed className="h-6 w-6 text-blue-600" />
              Real-time Bed Occupancy
            </CardTitle>
            <CardDescription className="mt-2">
              Current bed status across all departments
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <AddBedDialog hospitalId={hospitalId} onSuccess={fetchBeds} />
            <Button variant="outline" size="sm" onClick={fetchBeds}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Beds</p>
            <p className="text-2xl font-bold text-blue-600">
              {summary.totalBeds || 0}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <p className="text-sm text-gray-600 mb-1">Occupied</p>
            <p className="text-2xl font-bold text-red-600">
              {summary.occupiedBeds || 0}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-1">Available</p>
            <p className="text-2xl font-bold text-green-600">
              {summary.availableBeds || 0}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Utilization</p>
            <p className="text-2xl font-bold text-purple-600">
              {summary.totalBeds
                ? ((summary.occupiedBeds / summary.totalBeds) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Bed Type Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {beds.map((bed) => {
            const type = bedTypes[bed.bedType] || { label: bed.bedType, color: "bg-gray-500" };
            const utilization = getUtilizationRate(bed);
            const isHighUtilization = utilization > 80;

            return (
              <div
                key={bed._id}
                className={`p-4 rounded-lg border-2 ${
                  isHighUtilization
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                    <h3 className="font-semibold text-lg">{type.label}</h3>
                  </div>
                  {isHighUtilization && (
                    <Badge variant="destructive">High Utilization</Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-bold text-gray-900">{bed.totalBeds}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Occupied</p>
                    <p className="font-bold text-red-600">{bed.occupiedBeds}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Available</p>
                    <p className="font-bold text-green-600">{bed.availableBeds}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isHighUtilization ? "bg-red-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${utilization}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {utilization}% utilization
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {beds.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No bed occupancy data available
          </div>
        )}

        {bedItems.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Latest Bed Entries</h3>
              <Badge variant="outline">{bedItems.length} beds</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-2">Bed #</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Ward</th>
                    <th className="text-left p-2">Floor</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bedItems.slice(0, 8).map((bed) => (
                    <tr key={bed._id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{bed.bedNumber}</td>
                      <td className="p-2 capitalize">{bed.bedType}</td>
                      <td className="p-2">{bed.ward || "—"}</td>
                      <td className="p-2">{bed.floor ?? "—"}</td>
                      <td className="p-2">
                        <Badge
                          className={
                            bed.status === "available"
                              ? "bg-green-500 text-white"
                              : bed.status === "occupied"
                              ? "bg-red-500 text-white"
                              : "bg-yellow-500 text-white"
                          }
                        >
                          {bed.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BedOccupancyDashboard;

