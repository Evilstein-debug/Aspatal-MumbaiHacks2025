import EmergencyCase from "../models/emergencyCase.js";
import mongoose from "mongoose";
import { emitEmergencyCase } from "../socket/socketServer.js";
import { resolveHospitalId } from "../utils/hospitalHelper.js";

// Get all emergency cases
export const getEmergencyCases = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
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

    const cases = await EmergencyCase.find(query)
      .populate("doctorId", "name email")
      .populate("transferHospitalId", "name address")
      .sort({ arrivalTime: -1 });
    
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create emergency case
export const createEmergencyCase = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const caseId = `EMG-${hospitalId}-${Date.now()}`;

    const emergencyCase = new EmergencyCase({
      ...req.body,
      hospitalId,
      caseId,
      arrivalTime: new Date()
    });

    await emergencyCase.save();
    await emergencyCase.populate("doctorId", "name email");
    
    // Emit socket event for real-time update
    emitEmergencyCase(hospitalId, {
      ...emergencyCase.toObject(),
      doctorId: emergencyCase.doctorId
    });
    
    res.status(201).json(emergencyCase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update emergency case
export const updateEmergencyCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const updateData = { ...req.body };

    if (updateData.status === "discharged") {
      updateData.dischargeTime = new Date();
    }

    const emergencyCase = await EmergencyCase.findOneAndUpdate(
      { caseId },
      updateData,
      { new: true }
    )
      .populate("doctorId", "name email")
      .populate("transferHospitalId", "name address");

    if (!emergencyCase) {
      return res.status(404).json({ error: "Emergency case not found" });
    }

    res.json(emergencyCase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get critical cases
export const getCriticalCases = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const cases = await EmergencyCase.find({
      hospitalId,
      triageLevel: "critical",
      status: { $in: ["arrived", "triage", "treatment"] }
    })
      .populate("doctorId", "name email")
      .sort({ arrivalTime: 1 });

    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get emergency statistics
export const getEmergencyStatistics = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const { startDate, endDate } = req.query;

    const matchQuery = { hospitalId };
    if (startDate && endDate) {
      matchQuery.arrivalTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await EmergencyCase.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$triageLevel",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = await EmergencyCase.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const outcomeStats = await EmergencyCase.aggregate([
      { $match: { ...matchQuery, outcome: { $exists: true } } },
      {
        $group: {
          _id: "$outcome",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ triageStats: stats, statusStats, outcomeStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

