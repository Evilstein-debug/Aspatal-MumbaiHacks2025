import express from "express";
import {
  getAllBeds,
  getBedById,
  createBed,
  updateBed,
  deleteBed,
  getAvailableBeds
} from "../controllers/bedItemController.js";

const router = express.Router();

router.get("/:hospitalId", getAllBeds);
router.get("/:hospitalId/available", getAvailableBeds);
router.get("/item/:bedId", getBedById);
router.post("/:hospitalId", createBed);
router.put("/item/:bedId", updateBed);
router.delete("/item/:bedId", deleteBed);

export default router;

