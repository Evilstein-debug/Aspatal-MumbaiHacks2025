import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  MapPin,
  Clock,
  Bed,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { transferAPI } from "@/lib/api";
import { toast } from "sonner";
import PatientTransferDialog from "./PatientTransferDialog";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-blue-100 text-blue-800 border-blue-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  in_transit: "bg-purple-100 text-purple-800 border-purple-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-gray-100 text-gray-800 border-gray-300",
};

const bedTypeLabels = {
  general: "General",
  icu: "ICU",
  ventilator: "Ventilator",
  isolation: "Isolation",
};

const PatientTransferDashboard = ({ hospitalId = "default" }) => {
  const [transfers, setTransfers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, approved, completed

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transfersData, statsData] = await Promise.all([
        transferAPI.getTransferRequests(hospitalId, {
          ...(filter !== "all" && { status: filter }),
        }),
        transferAPI.getTransferStatistics(hospitalId),
      ]);
      setTransfers(transfersData);
      setStatistics(statsData);
    } catch (error) {
      toast.error("Failed to fetch transfer data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [hospitalId, filter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading && !transfers.length) {
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
    <>
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blue-600" />
                Patient Transfers
              </CardTitle>
              <CardDescription className="mt-2">
                Manage patient transfers across hospitals
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <PatientTransferDialog
                open={transferDialogOpen}
                onOpenChange={setTransferDialogOpen}
                hospitalId={hospitalId}
                onSuccess={fetchData}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTransferDialogOpen(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Transfer Patient
              </Button>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {statistics.statusStats?.map((stat) => (
                <div
                  key={stat._id}
                  className="rounded-lg border p-4 bg-gradient-to-br from-blue-50 to-white"
                >
                  <p className="text-sm text-gray-600 mb-1">
                    {stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {["all", "pending", "approved", "in_transit", "completed"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className="whitespace-nowrap"
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
              </Button>
            ))}
          </div>

          {/* Transfer List */}
          {transfers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No transfer requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div
                  key={transfer._id}
                  className="p-4 border-2 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {transfer.patientName}
                        </h3>
                        <Badge className={statusColors[transfer.status]}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(transfer.status)}
                            {transfer.status
                              .charAt(0)
                              .toUpperCase() +
                              transfer.status.slice(1).replace("_", " ")}
                          </span>
                        </Badge>
                        <Badge variant="outline">
                          {bedTypeLabels[transfer.bedType]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-700 mb-1">From</p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {transfer.fromHospitalId?.name || "Unknown Hospital"}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">To</p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {transfer.toHospitalId?.name || "Unknown Hospital"}
                          </p>
                        </div>
                        {transfer.distance && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Distance</p>
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {transfer.distance.toFixed(2)} km
                            </p>
                          </div>
                        )}
                        {transfer.estimatedTime && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Est. Time</p>
                            <p className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {transfer.estimatedTime} minutes
                            </p>
                          </div>
                        )}
                      </div>
                      {transfer.reason && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Reason:</span> {transfer.reason}
                          </p>
                        </div>
                      )}
                      {transfer.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 italic">{transfer.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-500 ml-4">
                      <p>Requested</p>
                      <p>{formatDate(transfer.requestedAt)}</p>
                      {transfer.approvedAt && (
                        <>
                          <p className="mt-2">Approved</p>
                          <p>{formatDate(transfer.approvedAt)}</p>
                        </>
                      )}
                      {transfer.completedAt && (
                        <>
                          <p className="mt-2">Completed</p>
                          <p>{formatDate(transfer.completedAt)}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PatientTransferDashboard;

