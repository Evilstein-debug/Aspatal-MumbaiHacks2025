import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital"
  },
  predictionType: {
    type: String,
    enum: ["pollution", "festival", "seasonal", "general"],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  predictedSurge: {
    type: Number,
    required: true,
    min: 0
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 75
  },
  factors: {
    pollutionLevel: {
      type: Number,
      min: 0,
      max: 500
    },
    festivalName: String,
    festivalIntensity: {
      type: String,
      enum: ["low", "medium", "high"]
    },
    weatherCondition: String,
    historicalData: {
      previousYearCases: Number,
      averageCases: Number
    }
  },
  recommendations: [String],
  affectedDepartments: [String],
  estimatedResourceNeeds: {
    beds: Number,
    doctors: Number,
    nurses: Number,
    equipment: [String]
  },
  status: {
    type: String,
    enum: ["predicted", "active", "completed"],
    default: "predicted"
  }
}, {
  timestamps: true
});

// Indexes
predictionSchema.index({ hospitalId: 1, date: 1 });
predictionSchema.index({ predictionType: 1, date: 1 });
predictionSchema.index({ date: 1 });

export default mongoose.model("Prediction", predictionSchema);

