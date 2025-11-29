import React, { useState } from "react";
import { Plus, Loader2, User } from "lucide-react";
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
import { opdAPI } from "@/lib/api";
import { toast } from "sonner";

const AddOPDPatientDialog = ({ hospitalId = "default", onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    department: "",
    complaint: "",
    priority: "normal",
    status: "waiting",
  });

  const departments = [
    "General Medicine",
    "Cardiology",
    "Orthopedics",
    "Pediatrics",
    "Dermatology",
    "Gynecology",
    "ENT",
    "Ophthalmology",
    "Dental",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await opdAPI.createPatient(hospitalId, {
        ...formData,
        age: parseInt(formData.age),
      });
      toast.success("OPD patient added successfully!");
      setOpen(false);
      setFormData({
        name: "",
        age: "",
        gender: "male",
        phone: "",
        department: "",
        complaint: "",
        priority: "normal",
        status: "waiting",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add patient");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add OPD Patient
          </DialogTitle>
          <DialogDescription>
            Register a new patient in the OPD queue
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Patient Name *</Label>
              <Input
                id="name"
                placeholder="Enter patient name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="department">Department *</Label>
              <select
                id="department"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                required
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint">Chief Complaint *</Label>
              <Input
                id="complaint"
                placeholder="Brief description of symptoms"
                value={formData.complaint}
                onChange={(e) =>
                  setFormData({ ...formData, complaint: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
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
                  <option value="waiting">Waiting</option>
                  <option value="consulting">Consulting</option>
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
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddOPDPatientDialog;

