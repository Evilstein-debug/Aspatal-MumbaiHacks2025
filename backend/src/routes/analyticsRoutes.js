import express from "express";
import {
  getAnalyticsLogs,
  getAnalyticsLogById,
  createAnalyticsLog,
  updateAnalyticsLog,
  deleteAnalyticsLog,
  getAnalyticsStats
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/:hospitalId", getAnalyticsLogs);
router.get("/:hospitalId/stats", getAnalyticsStats);
router.get("/item/:logId", getAnalyticsLogById);
router.post("/:hospitalId", createAnalyticsLog);
router.put("/item/:logId", updateAnalyticsLog);
router.delete("/item/:logId", deleteAnalyticsLog);

export default router;

