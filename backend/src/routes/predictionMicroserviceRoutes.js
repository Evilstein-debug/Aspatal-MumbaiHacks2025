import express from "express";
import {
  predictFestivalSurge,
  predictPollutionSurge,
  forecastStaff,
  getCombinedPrediction,
  checkPredictionServiceHealth
} from "../controllers/predictionMicroserviceController.js";

const router = express.Router();

// Health check (no auth required - must come first)
router.get("/health", checkPredictionServiceHealth);

// Prediction endpoints without hospitalId (must come before /:hospitalId routes)
router.post("/festival", predictFestivalSurge);
router.post("/pollution", predictPollutionSurge);
router.post("/staff", forecastStaff);
router.get("/combined", getCombinedPrediction);

// Hospital-specific predictions
router.post("/:hospitalId/festival", predictFestivalSurge);
router.post("/:hospitalId/pollution", predictPollutionSurge);
router.post("/:hospitalId/staff", forecastStaff);
router.get("/:hospitalId/combined", getCombinedPrediction);

export default router;

