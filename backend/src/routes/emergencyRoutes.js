import express from "express";
import {
  getEmergencyCases,
  createEmergencyCase,
  updateEmergencyCase,
  getCriticalCases,
  getEmergencyStatistics
} from "../controllers/emergencyController.js";

const router = express.Router();

router.get("/:hospitalId", getEmergencyCases);
router.get("/:hospitalId/critical", getCriticalCases);
router.get("/:hospitalId/statistics", getEmergencyStatistics);
router.post("/:hospitalId", createEmergencyCase);
router.put("/:caseId", updateEmergencyCase);

export default router;

