import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true,
    trim: true
  },
  qualifications: [String],
  licenseNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  shiftTimings: {
    morning: {
      startTime: String, // Format: "HH:MM"
      endTime: String,
      days: [{
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      }]
    },
    evening: {
      startTime: String,
      endTime: String,
      days: [{
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      }]
    },
    night: {
      startTime: String,
      endTime: String,
      days: [{
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      }]
    }
  },
  currentShift: {
    type: String,
    enum: ["morning", "evening", "night", "off"],
    default: "off"
  },
  status: {
    type: String,
    enum: ["active", "on-duty", "off-duty", "on-leave", "suspended"],
    default: "active"
  },
  maxPatientsPerDay: {
    type: Number,
    default: 30,
    min: 1
  },
  currentPatientCount: {
    type: Number,
    default: 0,
    min: 0
  },
  department: String,
  experience: Number, // years
  consultationFee: Number
}, {
  timestamps: true
});

// Indexes
doctorSchema.index({ hospitalId: 1, specialization: 1 });
doctorSchema.index({ email: 1 });
doctorSchema.index({ status: 1, currentShift: 1 });

export default mongoose.model("Doctor", doctorSchema);

