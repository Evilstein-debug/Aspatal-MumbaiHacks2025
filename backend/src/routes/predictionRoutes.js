import express from "express";
import {
  getPredictions,
  createPrediction,
  getUpcomingPredictions,
  updatePredictionStatus
} from "../controllers/predictionController.js";
import { getSurgeForecast } from "../controllers/surgeController.js"; // Add this import

const router = express.Router();

// Routes without hospitalId (must come first to avoid matching /:hospitalId)
router.get("/upcoming", getUpcomingPredictions);
router.get("/", getPredictions);

// Surge forecast route - Add this
router.get("/surge/forecast/:hospitalId", getSurgeForecast);

// Routes with hospitalId
router.get("/:hospitalId/upcoming", getUpcomingPredictions);
router.get("/:hospitalId", getPredictions);
router.post("/:hospitalId", createPrediction);

// Update prediction status (must come after /:hospitalId routes)
router.put("/:predictionId/status", updatePredictionStatus);

export default router;