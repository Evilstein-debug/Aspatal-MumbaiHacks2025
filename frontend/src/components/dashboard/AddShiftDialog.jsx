import React, { useState, useEffect } from "react";
import { Plus, Loader2, Clock } from "lucide-react";
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
import { shiftAPI, doctorAPI } from "@/lib/api";
import { toast } from "sonner";

const AddShiftDialog = ({ hospitalId = "default", onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: "",
    shiftType: "morning",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "17:00",
    maxPatientCapacity: "20",
    status: "scheduled",
  });

  useEffect(() => {
    if (open) {
      fetchDoctors();
    }
  }, [open, hospitalId]);

  const fetchDoctors = async () => {
    try {
      const data = await doctorAPI.getDoctors(hospitalId);
      setDoctors(data || []);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await shiftAPI.createShift(hospitalId, {
        ...formData,
        maxPatientCapacity: parseInt(formData.maxPatientCapacity),
      });
      toast.success("Shift scheduled successfully!");
      setOpen(false);
      setFormData({
        doctorId: "",
        shiftType: "morning",
        date: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "17:00",
        maxPatientCapacity: "20",
        status: "scheduled",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create shift");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getShiftTimings = (shiftType) => {
    const timings = {
      morning: { start: "09:00", end: "17:00" },
      evening: { start: "17:00", end: "01:00" },
      night: { start: "01:00", end: "09:00" },
    };
    return timings[shiftType] || timings.morning;
  };

  const handleShiftTypeChange = (shiftType) => {
    const timings = getShiftTimings(shiftType);
    setFormData({
      ...formData,
      shiftType,
      startTime: timings.start,
      endTime: timings.end,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Shift
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Doctor Shift
          </DialogTitle>
          <DialogDescription>
            Create a new shift schedule for a doctor
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="doctorId">Doctor *</Label>
              <select
                id="doctorId"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.doctorId}
                onChange={(e) =>
                  setFormData({ ...formData, doctorId: e.target.value })
                }
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shiftType">Shift Type *</Label>
                <select
                  id="shiftType"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.shiftType}
                  onChange={(e) => handleShiftTypeChange(e.target.value)}
                  required
                >
                  <option value="morning">Morning (9 AM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 1 AM)</option>
                  <option value="night">Night (1 AM - 9 AM)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPatientCapacity">Max Patients *</Label>
                <Input
                  id="maxPatientCapacity"
                  type="number"
                  min="1"
                  value={formData.maxPatientCapacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxPatientCapacity: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
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
                  Scheduling...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Shift
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddShiftDialog;

