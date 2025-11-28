import express from "express";
import {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  getActiveShifts,
  getShiftStatistics
} from "../controllers/shiftController.js";

const router = express.Router();

router.get("/:hospitalId", getShifts);
router.get("/:hospitalId/active", getActiveShifts);
router.get("/:hospitalId/statistics", getShiftStatistics);
router.post("/:hospitalId", createShift);
router.put("/:shiftId", updateShift);
router.delete("/:shiftId", deleteShift);

export default router;

