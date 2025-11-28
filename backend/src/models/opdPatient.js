import mongoose from "mongoose";

const opdPatientSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
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
  registrationTime: {
    type: Date,
    default: Date.now
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  doctorName: String,
  department: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["waiting", "consulting", "completed", "cancelled"],
    default: "waiting"
  },
  queueNumber: {
    type: Number,
    required: true
  },
  consultationStartTime: Date,
  consultationEndTime: Date,
  chiefComplaint: String,
  diagnosis: String,
  prescription: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date
}, {
  timestamps: true
});

// Indexes
opdPatientSchema.index({ hospitalId: 1, status: 1 });
opdPatientSchema.index({ registrationTime: -1 });
opdPatientSchema.index({ queueNumber: 1, hospitalId: 1 });

export default mongoose.model("OPDPatient", opdPatientSchema);

