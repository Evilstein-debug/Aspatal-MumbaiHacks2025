import express from "express";
import {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  acknowledgeAlert,
  getActiveAlerts
} from "../controllers/alertController.js";

const router = express.Router();

// Routes without hospitalId (must come first)
router.get("/active", getActiveAlerts);
router.get("/", getAllAlerts);

// Routes with hospitalId
router.get("/:hospitalId/active", getActiveAlerts);
router.get("/:hospitalId", getAllAlerts);
router.post("/:hospitalId", createAlert);

// Routes without hospitalId for POST (system-wide alerts)
router.post("/", createAlert);

// Item-specific routes (must come after /:hospitalId routes)
router.get("/item/:alertId", getAlertById);
router.put("/item/:alertId", updateAlert);
router.put("/item/:alertId/acknowledge", acknowledgeAlert);
router.delete("/item/:alertId", deleteAlert);

export default router;

