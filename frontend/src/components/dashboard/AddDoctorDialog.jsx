import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { doctorAPI } from "@/lib/api";
import { toast } from "sonner";

const AddDoctorDialog = ({ hospitalId = "default", onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
    licenseNumber: "",
    experience: "",
    status: "active",
  });

  const specializations = [
    "General Medicine",
    "Cardiology",
    "Orthopedics",
    "Pediatrics",
    "Emergency Medicine",
    "Surgery",
    "Neurology",
    "Oncology",
    "Gynecology",
    "Dermatology",
    "Psychiatry",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await doctorAPI.createDoctor(hospitalId, formData);
      toast.success("Doctor added successfully!");
      setOpen(false);
      setFormData({
        name: "",
        specialization: "",
        phone: "",
        email: "",
        licenseNumber: "",
        experience: "",
        status: "active",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add doctor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Doctor</DialogTitle>
          <DialogDescription>
            Add a new doctor to the hospital staff
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Doctor Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Dr. John Smith"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization *</Label>
              <select
                id="specialization"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                required
              >
                <option value="">Select specialization</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                required
                />
              </div>
              <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  placeholder="MED/LIC/12345"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                />
              </div>
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
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
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
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Doctor
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDoctorDialog;

