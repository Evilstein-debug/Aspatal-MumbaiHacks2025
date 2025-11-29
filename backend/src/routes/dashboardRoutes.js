import express from "express";
import { getDashboardOverview } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/dashboard/:hospitalId/overview - Get comprehensive dashboard data
router.get("/:hospitalId/overview", authenticate, getDashboardOverview);

export default router;