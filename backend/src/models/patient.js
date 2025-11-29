import mongoose, { Schema } from "mongoose";

const patientSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  // Common identifiers
  patientId: { type: String, required: true, unique: true }, // OPD-... or EMG-...
  name: { type: String, required: true },
  age: { type: Number, min: 0 },
  gender: { type: String, enum: ["male", "female", "other"] },
  phone: String,
  aadhaar: String,
  abhaId: String,

  // Type of patient record (controllers use patientType === "opd")
  patientType: {
    type: String,
    enum: ["opd", "emergency", "inpatient"],
    required: true,
    default: "opd"
  },

  // OPD-specific
  department: String,
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorName: String,
  queueNumber: Number,
  registrationTime: { type: Date },

  // Emergency-specific
  arrivalTime: { type: Date },
  triageLevel: { type: String, enum: ["critical", "urgent", "moderate", "minor"] },

  // Status covering OPD & emergency/inpatient workflows
  status: {
    type: String,
    enum: [
      "waiting",
      "consulting",
      "completed",
      "cancelled",
      "admitted",
      "discharged",
      "transferred"
    ],
    default: "waiting"
  },

  // Consultation timings
  consultationStartTime: Date,
  consultationEndTime: Date,
  dischargeTime: Date,

  // Clinical fields
  chiefComplaint: String,
  diagnosis: String,
  prescription: String,
  vitalSigns: Schema.Types.Mixed, // keep flexible (BP, HR, SpO2 etc.)

  // misc
  notes: String,
}, {
  timestamps: true
});

// Indexes used by controllers/queries
patientSchema.index({ hospitalId: 1 });
patientSchema.index({ hospitalId: 1, patientType: 1, status: 1 });
patientSchema.index({ registrationTime: -1 });
patientSchema.index({ queueNumber: 1, hospitalId: 1 });

export default mongoose.model("Patient", patientSchema);