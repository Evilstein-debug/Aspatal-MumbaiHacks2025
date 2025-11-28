import mongoose from "mongoose";

const bedSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  bedNumber: {
    type: String,
    required: true
  },
  bedType: {
    type: String,
    enum: ["general", "icu", "ventilator", "isolation", "private", "semi-private"],
    required: true
  },
  status: {
    type: String,
    enum: ["available", "occupied", "reserved", "maintenance", "cleaning"],
    default: "available",
    required: true
  },
  ward: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    min: 0
  },
  roomNumber: String,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient"
  },
  assignedNurseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  equipment: [{
    name: String,
    status: {
      type: String,
      enum: ["available", "in-use", "maintenance"],
      default: "available"
    }
  }],
  notes: String,
  lastCleaned: Date,
  lastMaintenance: Date
}, {
  timestamps: true
});

// Indexes
bedSchema.index({ hospitalId: 1, bedNumber: 1 }, { unique: true });
bedSchema.index({ hospitalId: 1, status: 1 });
bedSchema.index({ hospitalId: 1, bedType: 1 });
bedSchema.index({ patientId: 1 });

export default mongoose.model("Bed", bedSchema);

