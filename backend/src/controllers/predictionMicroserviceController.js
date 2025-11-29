import predictionService from "../services/predictionService.js";
import mongoose from "mongoose";

// Helper to handle prediction errors
const handlePredictionError = (error, res) => {
  // Check if it's a service unavailable error
  if (error.code === "SERVICE_UNAVAILABLE" || error.statusCode === 503) {
    return res.status(503).json({
      success: false,
      error: "Prediction service is unavailable",
      message: "The Python prediction microservice is not running. Please start it first.",
      details: error.message,
      help: "Run: cd prediction-service && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001"
    });
  }
  
  // Handle other errors
  const statusCode = error.response?.status || error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: error.response?.data?.detail || error.message || "Prediction failed",
    details: error.response?.data || undefined
  });
};

// Direct proxy to Python microservice - Festival prediction
export const predictFestivalSurge = async (req, res) => {
  try {
    const { hospitalId } = req.params || {};
    const result = await predictionService.predictFestivalSurge({
      ...req.body,
      ...(hospitalId && { hospitalId })
    });
    res.json(result);
  } catch (error) {
    console.error("Festival prediction error:", error.message);
    handlePredictionError(error, res);
  }
};

// Direct proxy to Python microservice - Pollution prediction
export const predictPollutionSurge = async (req, res) => {
  try {
    const { hospitalId } = req.params || {};
    const result = await predictionService.predictPollutionSurge({
      ...req.body,
      ...(hospitalId && { hospitalId })
    });
    res.json(result);
  } catch (error) {
    console.error("Pollution prediction error:", error.message);
    handlePredictionError(error, res);
  }
};

// Direct proxy to Python microservice - Staff forecast
export const forecastStaff = async (req, res) => {
  try {
    const { hospitalId } = req.params || {};
    const result = await predictionService.forecastStaff({
      ...req.body,
      ...(hospitalId && { hospitalId })
    });
    res.json(result);
  } catch (error) {
    console.error("Staff forecast error:", error.message);
    handlePredictionError(error, res);
  }
};

// Combined prediction endpoint
export const getCombinedPrediction = async (req, res) => {
  try {
    const { hospitalId } = req.params || {};
    const result = await predictionService.getCombinedPrediction({
      ...req.query,
      ...(hospitalId && { hospitalId })
    });
    res.json(result);
  } catch (error) {
    console.error("Combined prediction error:", error.message);
    handlePredictionError(error, res);
  }
};

// Health check for prediction service
export const checkPredictionServiceHealth = async (req, res) => {
  try {
    const health = await predictionService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(503).json({ 
      status: "unhealthy", 
      error: error.message 
    });
  }
};

