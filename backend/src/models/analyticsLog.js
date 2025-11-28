import mongoose from "mongoose";

const analyticsLogSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  hour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  date: {
    type: Date,
    required: true
  },
  footfall: {
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    opd: {
      type: Number,
      default: 0,
      min: 0
    },
    emergency: {
      type: Number,
      default: 0,
      min: 0
    },
    inpatient: {
      type: Number,
      default: 0,
      min: 0
    },
    outpatient: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  bedOccupancy: {
    total: Number,
    occupied: Number,
    available: Number,
    utilizationRate: Number
  },
  departmentStats: [{
    department: String,
    patients: Number,
    doctors: Number,
    nurses: Number
  }],
  waitTimes: {
    opd: {
      average: Number,
      min: Number,
      max: Number
    },
    emergency: {
      average: Number,
      min: Number,
      max: Number
    }
  },
  resourceUtilization: {
    doctors: Number,
    nurses: Number,
    equipment: Number
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for efficient queries
analyticsLogSchema.index({ hospitalId: 1, timestamp: -1 });
analyticsLogSchema.index({ hospitalId: 1, date: -1 });
analyticsLogSchema.index({ hospitalId: 1, hour: 1, date: 1 });
analyticsLogSchema.index({ timestamp: -1 });

export default mongoose.model("AnalyticsLog", analyticsLogSchema);

