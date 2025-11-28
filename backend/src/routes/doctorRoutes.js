import express from "express";
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorsOnDuty
} from "../controllers/doctorController.js";

const router = express.Router();

router.get("/:hospitalId", getAllDoctors);
router.get("/:hospitalId/on-duty", getDoctorsOnDuty);
router.get("/item/:doctorId", getDoctorById);
router.post("/:hospitalId", createDoctor);
router.put("/item/:doctorId", updateDoctor);
router.delete("/item/:doctorId", deleteDoctor);

export default router;

