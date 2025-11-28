import mongoose from "mongoose";

const emergencyCaseSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  caseId: {
    type: String,
    required: true,
    unique: true
  },
  patientName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 0
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  aadhaar: String,
  abhaId: String,
  arrivalTime: {
    type: Date,
    default: Date.now
  },
  triageLevel: {
    type: String,
    enum: ["critical", "urgent", "moderate", "minor"],
    required: true
  },
  chiefComplaint: {
    type: String,
    required: true
  },
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    oxygenSaturation: Number,
    respiratoryRate: Number
  },
  assignedDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  assignedDoctorName: String,
  status: {
    type: String,
    enum: ["arrived", "triage", "treatment", "admitted", "discharged", "transferred"],
    default: "arrived"
  },
  bedAllocated: {
    type: Boolean,
    default: false
  },
  bedId: String,
  treatmentNotes: String,
  outcome: {
    type: String,
    enum: ["recovered", "admitted", "transferred", "deceased", "discharged"]
  },
  dischargeTime: Date,
  transferHospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital"
  }
}, {
  timestamps: true
});

// Indexes
emergencyCaseSchema.index({ hospitalId: 1, status: 1 });
emergencyCaseSchema.index({ arrivalTime: -1 });
emergencyCaseSchema.index({ triageLevel: 1, status: 1 });

export default mongoose.model("EmergencyCase", emergencyCaseSchema);

