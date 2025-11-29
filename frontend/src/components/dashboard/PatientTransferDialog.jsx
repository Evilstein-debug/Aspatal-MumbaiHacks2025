import React, { useState, useEffect } from "react";
import { Loader2, MapPin, Clock, Bed, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { transferAPI } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const PatientTransferDialog = ({ open, onOpenChange, hospitalId, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Patient Info, 2: Select Hospital
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [availableHospitals, setAvailableHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [formData, setFormData] = useState({
    patientName: "",
    patientAge: "",
    patientGender: "male",
    bedType: "general",
    reason: "Hospital at full capacity",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedHospital(null);
      setAvailableHospitals([]);
      setFormData({
        patientName: "",
        patientAge: "",
        patientGender: "male",
        bedType: "general",
        reason: "Hospital at full capacity",
        notes: "",
      });
    }
  }, [open]);

  const handleSearchHospitals = async () => {
    if (!formData.patientName || !formData.bedType) {
      toast.error("Please fill in patient name and select bed type");
      return;
    }

    setSearching(true);
    try {
      const data = await transferAPI.findAvailableHospitals(
        hospitalId,
        formData.bedType
      );
      setAvailableHospitals(data.availableHospitals || []);
      if (data.availableHospitals?.length === 0) {
        toast.warning("No available hospitals found for this bed type");
      } else {
        setStep(2);
        toast.success(`Found ${data.availableHospitals.length} available hospitals`);
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to search hospitals";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectHospital = (hospital) => {
    setSelectedHospital(hospital);
  };

  const handleTransfer = async () => {
    if (!selectedHospital) {
      toast.error("Please select a hospital");
      return;
    }

    setLoading(true);
    try {
      await transferAPI.createTransferRequest(hospitalId, {
        toHospitalId: selectedHospital.hospitalId,
        patientName: formData.patientName,
        patientAge: formData.patientAge ? parseInt(formData.patientAge) : undefined,
        patientGender: formData.patientGender,
        bedType: formData.bedType,
        reason: formData.reason,
        notes: formData.notes,
      });
      toast.success(`Transfer request created for ${selectedHospital.hospitalName}`);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMessage = error.message || "Failed to create transfer request";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const bedTypeLabels = {
    general: "General",
    icu: "ICU",
    ventilator: "Ventilator",
    isolation: "Isolation",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Transfer Patient
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter patient details and search for available hospitals"
              : "Select the best hospital for transfer"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="patientAge">Age</Label>
                <Input
                  id="patientAge"
                  type="number"
                  placeholder="25"
                  value={formData.patientAge}
                  onChange={(e) =>
                    setFormData({ ...formData, patientAge: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientGender">Gender</Label>
                <select
                  id="patientGender"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.patientGender}
                  onChange={(e) =>
                    setFormData({ ...formData, patientGender: e.target.value })
                  }
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedType">Bed Type Required *</Label>
                <select
                  id="bedType"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.bedType}
                  onChange={(e) =>
                    setFormData({ ...formData, bedType: e.target.value })
                  }
                  required
                >
                  <option value="general">General</option>
                  <option value="icu">ICU</option>
                  <option value="ventilator">Ventilator</option>
                  <option value="isolation">Isolation</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Transfer Reason</Label>
              <Input
                id="reason"
                placeholder="Reason for transfer"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            {availableHospitals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No available hospitals found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {availableHospitals.map((hospital) => (
                  <div
                    key={hospital.hospitalId}
                    onClick={() => handleSelectHospital(hospital)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedHospital?.hospitalId === hospital.hospitalId
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {hospital.hospitalName}
                          </h3>
                          {selectedHospital?.hospitalId === hospital.hospitalId && (
                            <Badge className="bg-blue-600">Selected</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {hospital.address || "Address not available"}
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span>{hospital.distance?.toFixed(2) || "N/A"} km</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span>
                              {hospital.estimatedTime
                                ? `${hospital.estimatedTime} min`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Bed className="h-4 w-4 text-purple-600" />
                            <span>
                              {hospital.availableBeds} / {hospital.totalBeds} beds
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                hospital.availableBeds > 5
                                  ? "border-green-500 text-green-700"
                                  : hospital.availableBeds > 2
                                  ? "border-yellow-500 text-yellow-700"
                                  : "border-red-500 text-red-700"
                              }
                            >
                              {bedTypeLabels[hospital.bedType]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={searching}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSearchHospitals}
                disabled={searching || !formData.patientName || !formData.bedType}
              >
                {searching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Find Hospitals
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleTransfer}
                disabled={loading || !selectedHospital}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Transfer Patient
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientTransferDialog;

