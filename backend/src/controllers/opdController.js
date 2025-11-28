import OPDPatient from "../models/opdPatient.js";
import mongoose from "mongoose";
import { emitOPDQueueUpdate } from "../socket/socketServer.js";

// Get all OPD patients
export const getOPDPatients = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { status, date, department } = req.query;

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
      .sort({ queueNumber: 1, registrationTime: -1 });
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create OPD patient
export const createOPDPatient = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    // Get the next queue number for today
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
    
    // Emit socket event for real-time update
    const queue = await OPDPatient.find({
      hospitalId,
      status: { $in: ["waiting", "consulting"] }
    })
      .populate("doctorId", "name email")
      .sort({ queueNumber: 1 });
    
    emitOPDQueueUpdate(hospitalId, {
      patient: patient.toObject(),
      queue: queue,
      queueLength: queue.length
    });
    
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update OPD patient
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
      return res.status(404).json({ error: "Patient not found" });
    }

    // Emit socket event for queue update
    const queue = await OPDPatient.find({
      hospitalId: patient.hospitalId,
      status: { $in: ["waiting", "consulting"] }
    })
      .populate("doctorId", "name email")
      .sort({ queueNumber: 1 });
    
    emitOPDQueueUpdate(patient.hospitalId.toString(), {
      patient: patient.toObject(),
      queue: queue,
      queueLength: queue.length
    });

    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get OPD queue
export const getOPDQueue = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { department } = req.query;

    const query = { 
      hospitalId, 
      status: { $in: ["waiting", "consulting"] }
    };
    if (department) query.department = department;

    const queue = await OPDPatient.find(query)
      .populate("doctorId", "name email")
      .sort({ queueNumber: 1 });

    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get OPD statistics
export const getOPDStatistics = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { startDate, endDate } = req.query;

    const matchQuery = { hospitalId };
    if (startDate && endDate) {
      matchQuery.registrationTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await OPDPatient.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await OPDPatient.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ statusStats: stats, departmentStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

