import mongoose from "mongoose";

const epidemicSignalSchema = new mongoose.Schema({
  district: String,

  pharmacyTrends: Number,
  symptomTrends: Number,
  newsScore: Number,
  eventRisk: Number,
  hospitalLoad: Number,

  aggregatedRiskScore: Number,

  alertLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"]
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("EpidemicSignal", epidemicSignalSchema);