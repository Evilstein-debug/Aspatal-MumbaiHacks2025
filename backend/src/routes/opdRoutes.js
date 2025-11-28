import express from "express";
import {
  getOPDPatients,
  createOPDPatient,
  updateOPDPatient,
  getOPDQueue,
  getOPDStatistics
} from "../controllers/opdController.js";

const router = express.Router();

router.get("/:hospitalId", getOPDPatients);
router.get("/:hospitalId/queue", getOPDQueue);
router.get("/:hospitalId/statistics", getOPDStatistics);
router.post("/:hospitalId", createOPDPatient);
router.put("/:patientId", updateOPDPatient);

export default router;

