import Prediction from "../models/prediction.js";
import mongoose from "mongoose";

// Get predictions
export const getPredictions = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { predictionType, startDate, endDate } = req.query;

    const query = { hospitalId: hospitalId || { $exists: true } };
    if (predictionType) query.predictionType = predictionType;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const predictions = await Prediction.find(query)
      .populate("hospitalId", "name address")
      .sort({ date: -1 });

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create prediction (placeholder API)
export const createPrediction = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const {
      predictionType,
      date,
      pollutionLevel,
      festivalName,
      festivalIntensity
    } = req.body;

    // Placeholder prediction logic
    let predictedSurge = 0;
    let confidence = 75;
    const recommendations = [];
    const affectedDepartments = ["General", "Emergency"];

    if (predictionType === "pollution" && pollutionLevel) {
      // Simple prediction based on pollution level
      if (pollutionLevel > 300) {
        predictedSurge = Math.floor(pollutionLevel / 10);
        confidence = 85;
        recommendations.push("Increase respiratory department capacity");
        recommendations.push("Stock up on nebulizers and oxygen");
        affectedDepartments.push("Respiratory", "Cardiology");
      } else if (pollutionLevel > 200) {
        predictedSurge = Math.floor(pollutionLevel / 15);
        confidence = 75;
        recommendations.push("Monitor respiratory cases closely");
      }
    }

    if (predictionType === "festival" && festivalName) {
      // Simple prediction based on festival intensity
      const intensityMultiplier = {
        low: 1.2,
        medium: 1.5,
        high: 2.0
      };
      const baseSurge = 50;
      predictedSurge = Math.floor(baseSurge * (intensityMultiplier[festivalIntensity] || 1.2));
      confidence = 70;
      recommendations.push(`Prepare for ${festivalName} surge`);
      recommendations.push("Increase emergency department staff");
      recommendations.push("Coordinate with nearby hospitals");
      affectedDepartments.push("Emergency", "Orthopedics", "General");
    }

    const prediction = new Prediction({
      hospitalId,
      predictionType,
      date: new Date(date),
      predictedSurge,
      confidence,
      factors: {
        pollutionLevel,
        festivalName,
        festivalIntensity,
        historicalData: {
          previousYearCases: predictedSurge * 0.9,
          averageCases: predictedSurge * 0.8
        }
      },
      recommendations,
      affectedDepartments,
      estimatedResourceNeeds: {
        beds: Math.ceil(predictedSurge * 0.3),
        doctors: Math.ceil(predictedSurge * 0.05),
        nurses: Math.ceil(predictedSurge * 0.1),
        equipment: ["Oxygen", "Ventilators", "Monitoring Equipment"]
      }
    });

    await prediction.save();
    await prediction.populate("hospitalId", "name address");
    res.status(201).json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get upcoming predictions
export const getUpcomingPredictions = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const predictions = await Prediction.find({
      hospitalId: hospitalId || { $exists: true },
      date: { $gte: today },
      status: { $in: ["predicted", "active"] }
    })
      .populate("hospitalId", "name address")
      .sort({ date: 1 })
      .limit(10);

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update prediction status
export const updatePredictionStatus = async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { status } = req.body;

    const prediction = await Prediction.findByIdAndUpdate(
      predictionId,
      { status },
      { new: true }
    ).populate("hospitalId", "name address");

    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

