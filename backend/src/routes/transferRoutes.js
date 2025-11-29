import express from "express";
import {
  checkHospitalCapacity,
  findAvailableHospitals,
  createTransferRequest,
  getTransferRequests,
  updateTransferStatus,
  getTransferStatistics
} from "../controllers/transferController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Check if hospital is at full capacity
router.get("/capacity/:hospitalId", checkHospitalCapacity);

// Find nearest hospitals with bed availability
router.get("/available/:hospitalId", findAvailableHospitals);

// Get all transfer requests for a hospital
router.get("/requests/:hospitalId", getTransferRequests);

// Create a patient transfer request
router.post("/request/:hospitalId", authenticate, createTransferRequest);

// Update transfer status (approve, reject, complete, cancel)
router.put("/:transferId", authenticate, updateTransferStatus);

// Get transfer statistics
router.get("/statistics/:hospitalId", getTransferStatistics);

export default router;

