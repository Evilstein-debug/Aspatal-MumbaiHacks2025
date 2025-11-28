import mongoose from "mongoose";

const doctorShiftSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  shiftType: {
    type: String,
    enum: ["morning", "evening", "night"],
    required: true
  },
  shiftDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["scheduled", "active", "completed", "cancelled"],
    default: "scheduled"
  },
  currentPatientCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxPatientCapacity: {
    type: Number,
    default: 30
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
doctorShiftSchema.index({ hospitalId: 1, shiftDate: 1 });
doctorShiftSchema.index({ doctorId: 1, shiftDate: 1 });
doctorShiftSchema.index({ status: 1, shiftDate: 1 });

export default mongoose.model("DoctorShift", doctorShiftSchema);

