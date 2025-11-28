import OPDPatient from "../models/opdPatient.js";
import EmergencyCase from "../models/emergencyCase.js";
import mongoose from "mongoose";

// Validation helpers
const validateOPDPatient = (data) => {
  const errors = [];
  if (!data.name || data.name.trim() === "") errors.push("Name is required");
  if (!data.age || data.age < 0) errors.push("Valid age is required");
  if (!data.gender || !["male", "female", "other"].includes(data.gender)) {
    errors.push("Valid gender is required");
  }
  if (!data.phone || data.phone.trim() === "") errors.push("Phone is required");
  if (!data.department || data.department.trim() === "") {
    errors.push("Department is required");
  }
  return errors;
};

const validateEmergencyPatient = (data) => {
  const errors = [];
  if (!data.patientName || data.patientName.trim() === "") {
    errors.push("Patient name is required");
  }
  if (!data.age || data.age < 0) errors.push("Valid age is required");
  if (!data.gender || !["male", "female", "other"].includes(data.gender)) {
    errors.push("Valid gender is required");
  }
  if (!data.phone || data.phone.trim() === "") errors.push("Phone is required");
  if (!data.triageLevel || !["critical", "urgent", "moderate", "minor"].includes(data.triageLevel)) {
    errors.push("Valid triage level is required");
  }
  if (!data.chiefComplaint || data.chiefComplaint.trim() === "") {
    errors.push("Chief complaint is required");
  }
  return errors;
};

// OPD Patient CRUD
export const getAllOPDPatients = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { status, department, date } = req.query;

    const query = { hospitalId };
    if (status) query.status = status;
    if (department) query.department = department;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.registrationTime = { $gte: startDate, $lte: endDate };
    }

    const patients = await OPDPatient.find(query)
      .populate("doctorId", "name email")
      .sort({ queueNumber: 1 });

    res.json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createOPDPatient = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const errors = validateOPDPatient(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastPatient = await OPDPatient.findOne({
      hospitalId,
      registrationTime: { $gte: today, $lt: tomorrow }
    }).sort({ queueNumber: -1 });

    const queueNumber = lastPatient ? lastPatient.queueNumber + 1 : 1;
    const patientId = `OPD-${hospitalId}-${Date.now()}`;

    const patient = new OPDPatient({
      ...req.body,
      hospitalId,
      patientId,
      queueNumber,
      registrationTime: new Date()
    });

    await patient.save();
    await patient.populate("doctorId", "name email");

    res.status(201).json({
      success: true,
      message: "OPD patient registered successfully",
      data: patient
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateOPDPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = { ...req.body };

    if (updateData.status === "consulting") {
      updateData.consultationStartTime = new Date();
    }
    if (updateData.status === "completed") {
      updateData.consultationEndTime = new Date();
    }

    const patient = await OPDPatient.findOneAndUpdate(
      { patientId },
      updateData,
      { new: true }
    ).populate("doctorId", "name email");

    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }

    res.json({ success: true, message: "Patient updated successfully", data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteOPDPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await OPDPatient.findOneAndDelete({ patientId });

    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }

    res.json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Emergency Patient CRUD
export const getAllEmergencyPatients = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { status, triageLevel, date } = req.query;

    const query = { hospitalId };
    if (status) query.status = status;
    if (triageLevel) query.triageLevel = triageLevel;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.arrivalTime = { $gte: startDate, $lte: endDate };
    }

    const patients = await EmergencyCase.find(query)
      .populate("doctorId", "name email")
      .sort({ arrivalTime: -1 });

    res.json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createEmergencyPatient = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const errors = validateEmergencyPatient(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: "Validation failed", details: errors });
    }

    const caseId = `EMG-${hospitalId}-${Date.now()}`;
    const patient = new EmergencyCase({
      ...req.body,
      hospitalId,
      caseId,
      arrivalTime: new Date()
    });

    await patient.save();
    await patient.populate("doctorId", "name email");

    res.status(201).json({
      success: true,
      message: "Emergency case created successfully",
      data: patient
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateEmergencyPatient = async (req, res) => {
  try {
    const { caseId } = req.params;
    const updateData = { ...req.body };

    if (updateData.status === "discharged") {
      updateData.dischargeTime = new Date();
    }

    const patient = await EmergencyCase.findOneAndUpdate(
      { caseId },
      updateData,
      { new: true }
    ).populate("doctorId", "name email");

    if (!patient) {
      return res.status(404).json({ success: false, error: "Emergency case not found" });
    }

    res.json({ success: true, message: "Emergency case updated successfully", data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteEmergencyPatient = async (req, res) => {
  try {
    const { caseId } = req.params;
    const patient = await EmergencyCase.findOneAndDelete({ caseId });

    if (!patient) {
      return res.status(404).json({ success: false, error: "Emergency case not found" });
    }

    res.json({ success: true, message: "Emergency case deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

