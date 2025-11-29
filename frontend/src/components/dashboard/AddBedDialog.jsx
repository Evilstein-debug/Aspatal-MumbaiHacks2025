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
import { bedItemAPI } from "@/lib/api";
import { toast } from "sonner";

const AddBedDialog = ({ hospitalId = "default", onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bedNumber: "",
    bedType: "general",
    ward: "",
    floor: "",
    status: "available",
    notes: "",
  });

  const bedTypes = [
    { value: "general", label: "General" },
    { value: "icu", label: "ICU" },
    { value: "ventilator", label: "Ventilator" },
    { value: "isolation", label: "Isolation" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await bedItemAPI.createBed(hospitalId, formData);

      toast.success("Bed added successfully!");
      setOpen(false);
      setFormData({
        bedNumber: "",
        bedType: "general",
        ward: "",
        floor: "",
        status: "available",
        notes: "",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add bed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Bed
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Bed</DialogTitle>
          <DialogDescription>
            Add a new bed to the hospital inventory
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedNumber">Bed Number *</Label>
                <Input
                  id="bedNumber"
                  placeholder="e.g., B-101"
                  value={formData.bedNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, bedNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedType">Bed Type *</Label>
                <select
                  id="bedType"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.bedType}
                  onChange={(e) =>
                    setFormData({ ...formData, bedType: e.target.value })
                  }
                  required
                >
                  {bedTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ward">Ward *</Label>
                <Input
                  id="ward"
                  placeholder="e.g., Ward A"
                  value={formData.ward}
                  onChange={(e) =>
                    setFormData({ ...formData, ward: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="e.g., 1"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: e.target.value })
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
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional notes (optional)"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
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
                  Add Bed
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBedDialog;
