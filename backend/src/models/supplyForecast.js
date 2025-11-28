import mongoose from "mongoose";

const supplyForecastSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital"
  },

  oxygenDemand: Number,
  ventilatorDemand: Number,
  ppeDemand: Number,

  festivalFactor: Number,
  seasonalFactor: Number,
  epidemicFactor: Number,

  predictedShortageDate: Date,
  recommendation: String,

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("SupplyForecast", supplyForecastSchema);