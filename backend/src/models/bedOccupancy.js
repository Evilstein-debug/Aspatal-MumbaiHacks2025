import mongoose from "mongoose";

const bedOccupancySchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  bedType: {
    type: String,
    enum: ["general", "icu", "ventilator", "isolation"],
    required: true
  },
  totalBeds: {
    type: Number,
    required: true,
    min: 0
  },
  occupiedBeds: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  availableBeds: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reservedBeds: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
bedOccupancySchema.index({ hospitalId: 1, bedType: 1 });
bedOccupancySchema.index({ lastUpdated: -1 });

export default mongoose.model("BedOccupancy", bedOccupancySchema);

