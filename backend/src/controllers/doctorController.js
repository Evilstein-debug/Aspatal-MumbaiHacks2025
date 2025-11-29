import Doctor from "../models/doctor.js";
import mongoose from "mongoose";
import { emitDoctorShiftChange } from "../socket/socketServer.js";
import { resolveHospitalId } from "../utils/hospitalHelper.js";

// Validation helper
const validateDoctorData = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.trim() === "") {
      errors.push("Name is required");
    }
  }
  if (!isUpdate || data.specialization !== undefined) {
    if (!data.specialization || data.specialization.trim() === "") {
      errors.push("Specialization is required");
    }
  }
  if (!isUpdate || data.email !== undefined) {
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Valid email is required");
    }
  }
  if (!isUpdate || data.phone !== undefined) {
    if (!data.phone || data.phone.trim() === "") {
      errors.push("Phone number is required");
    }
  }
  
  return errors;
};

// GET /api/doctors - Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const { specialization, status, currentShift, department } = req.query;

    const query = { hospitalId };
    if (specialization) query.specialization = new RegExp(specialization, "i");
    if (status) query.status = status;
    if (currentShift) query.currentShift = currentShift;
    if (department) query.department = department;

    const doctors = await Doctor.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/doctors/:doctorId - Get single doctor
export const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor not found" });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/doctors - Create new doctor
export const createDoctor = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const validationErrors = validateDoctorData(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors
      });
    }

    // Check if email already exists
    const existingDoctor = await Doctor.findOne({ email: req.body.email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        error: "Doctor with this email already exists"
      });
    }

    const doctor = new Doctor({
      ...req.body,
      hospitalId
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: doctor
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Doctor with this email or license number already exists"
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/doctors/:doctorId - Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const validationErrors = validateDoctorData(req.body, true);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor not found" });
    }

    // Emit socket event if shift or status changed
    if (req.body.currentShift || req.body.status) {
      emitDoctorShiftChange(doctor.hospitalId.toString(), {
        doctorId: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        currentShift: doctor.currentShift,
        status: doctor.status,
        action: req.body.status === "on-duty" ? "login" : req.body.status === "off-duty" ? "logout" : "shift_change"
      });
    }

    res.json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/doctors/:doctorId - Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor not found" });
    }

    if (doctor.status === "on-duty") {
      return res.status(400).json({
        success: false,
        error: "Cannot delete doctor who is currently on duty"
      });
    }

    await Doctor.findByIdAndDelete(doctorId);

    res.json({
      success: true,
      message: "Doctor deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/doctors/:hospitalId/on-duty - Get doctors on duty
export const getDoctorsOnDuty = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const doctors = await Doctor.find({
      hospitalId,
      status: "on-duty"
    }).sort({ specialization: 1 });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

