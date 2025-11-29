import React, { useState } from "react";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emergencyAPI } from "@/lib/api";
import { toast } from "sonner";

const AddEmergencyDialog = ({ hospitalId = "default", onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "male",
    phone: "",
    triageLevel: "moderate",
    chiefComplaint: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      oxygenSaturation: "",
    },
    status: "active",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await emergencyAPI.createCase(hospitalId, {
        ...formData,
        age: parseInt(formData.age),
        vitalSigns: {
          ...formData.vitalSigns,
          bloodPressure: formData.vitalSigns.bloodPressure || undefined,
          heartRate: formData.vitalSigns.heartRate ? parseInt(formData.vitalSigns.heartRate) : undefined,
          temperature: formData.vitalSigns.temperature ? parseFloat(formData.vitalSigns.temperature) : undefined,
          oxygenSaturation: formData.vitalSigns.oxygenSaturation ? parseFloat(formData.vitalSigns.oxygenSaturation) : undefined,
        },
      });
      toast.success("Emergency case logged successfully!");
      setOpen(false);
      setFormData({
        patientName: "",
        age: "",
        gender: "male",
        phone: "",
        triageLevel: "moderate",
        chiefComplaint: "",
        vitalSigns: {
          bloodPressure: "",
          heartRate: "",
          temperature: "",
          oxygenSaturation: "",
        },
        status: "active",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to log emergency case");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Log Emergency
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Log Emergency Case
          </DialogTitle>
          <DialogDescription>
            Register a new emergency case with triage information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                placeholder="Enter patient name"
                value={formData.patientName}
                onChange={(e) =>
                  setFormData({ ...formData, patientName: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="150"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <select
                  id="gender"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="triageLevel">Triage Level *</Label>
                <select
                  id="triageLevel"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.triageLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, triageLevel: e.target.value })
                  }
                  required
                >
                  <option value="critical">Critical</option>
                  <option value="urgent">Urgent</option>
                  <option value="moderate">Moderate</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
              <Input
                id="chiefComplaint"
                placeholder="Brief description of emergency"
                value={formData.chiefComplaint}
                onChange={(e) =>
                  setFormData({ ...formData, chiefComplaint: e.target.value })
                }
                required
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Vital Signs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Blood Pressure</Label>
                  <Input
                    id="bloodPressure"
                    placeholder="120/80"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitalSigns: {
                          ...formData.vitalSigns,
                          bloodPressure: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    placeholder="72"
                    value={formData.vitalSigns.heartRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitalSigns: {
                          ...formData.vitalSigns,
                          heartRate: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="37.0"
                    value={formData.vitalSigns.temperature}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitalSigns: {
                          ...formData.vitalSigns,
                          temperature: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oxygenSaturation">O2 Saturation (%)</Label>
                  <Input
                    id="oxygenSaturation"
                    type="number"
                    step="0.1"
                    placeholder="98"
                    value={formData.vitalSigns.oxygenSaturation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vitalSigns: {
                          ...formData.vitalSigns,
                          oxygenSaturation: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="under_treatment">Under Treatment</option>
                <option value="discharged">Discharged</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Emergency
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmergencyDialog;

