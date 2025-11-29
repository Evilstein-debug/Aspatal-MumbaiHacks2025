import mongoose from "mongoose";

const patientTransferSchema = new mongoose.Schema({
  fromHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  toHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  },
  emergencyCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmergencyCase"
  },
  patientName: {
    type: String,
    required: true
  },
  patientAge: Number,
  patientGender: String,
  bedType: {
    type: String,
    enum: ["general", "icu", "ventilator", "isolation"],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "in_transit", "completed", "cancelled"],
    default: "pending"
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  distance: {
    type: Number, // Distance in kilometers
    required: true
  },
  estimatedTime: {
    type: Number // Estimated travel time in minutes
  },
  notes: String,
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

// Indexes
patientTransferSchema.index({ fromHospitalId: 1, status: 1 });
patientTransferSchema.index({ toHospitalId: 1, status: 1 });
patientTransferSchema.index({ status: 1, requestedAt: -1 });

export default mongoose.model("PatientTransfer", patientTransferSchema);

