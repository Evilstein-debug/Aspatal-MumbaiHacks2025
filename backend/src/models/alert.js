import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital"
  },
  alertType: {
    type: String,
    enum: ["pollution", "festival_surge", "emergency", "inventory_low", "bed_shortage", "staff_shortage", "system"],
    required: true
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ["system", "manual", "api", "sensor"],
    default: "system"
  },
  // Pollution-specific data
  pollutionData: {
    aqi: Number,
    pm25: Number,
    pm10: Number,
    location: String
  },
  // Festival surge data
  festivalData: {
    festivalName: String,
    startDate: Date,
    endDate: Date,
    expectedSurge: Number,
    intensity: {
      type: String,
      enum: ["low", "medium", "high"]
    }
  },
  // Emergency data
  emergencyData: {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyCase"
    },
    triageLevel: String,
    patientName: String
  },
  // Inventory alert data
  inventoryData: {
    itemName: String,
    currentStock: Number,
    threshold: Number,
    unit: String
  },
  status: {
    type: String,
    enum: ["active", "acknowledged", "resolved", "dismissed"],
    default: "active"
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  acknowledgedAt: Date,
  resolvedAt: Date,
  actionTaken: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
alertSchema.index({ hospitalId: 1, status: 1 });
alertSchema.index({ alertType: 1, severity: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ status: 1, severity: 1 });

export default mongoose.model("Alert", alertSchema);

