import express from "express";
import {
  getAllOPDPatients,
  createOPDPatient,
  updateOPDPatient,
  deleteOPDPatient,
  getAllEmergencyPatients,
  createEmergencyPatient,
  updateEmergencyPatient,
  deleteEmergencyPatient
} from "../controllers/patientController.js";

const router = express.Router();

// OPD Patient routes
router.get("/opd/:hospitalId", getAllOPDPatients);
router.post("/opd/:hospitalId", createOPDPatient);
router.put("/opd/:patientId", updateOPDPatient);
router.delete("/opd/:patientId", deleteOPDPatient);

// Emergency Patient routes
router.get("/emergency/:hospitalId", getAllEmergencyPatients);
router.post("/emergency/:hospitalId", createEmergencyPatient);
router.put("/emergency/:caseId", updateEmergencyPatient);
router.delete("/emergency/:caseId", deleteEmergencyPatient);

export default router;

