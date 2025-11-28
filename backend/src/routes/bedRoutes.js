import express from "express";
import {
  getBedOccupancy,
  getRealTimeBedOccupancy,
  updateBedOccupancy,
  createBedOccupancy,
  getBedStatistics
} from "../controllers/bedOccupancyController.js";

const router = express.Router();

router.get("/:hospitalId", getBedOccupancy);
router.get("/:hospitalId/realtime", getRealTimeBedOccupancy);
router.get("/:hospitalId/statistics", getBedStatistics);
router.post("/:hospitalId", createBedOccupancy);
router.put("/:hospitalId/:bedType", updateBedOccupancy);

export default router;

