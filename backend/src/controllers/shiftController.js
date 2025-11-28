import DoctorShift from "../models/doctorShift.js";
import mongoose from "mongoose";

// Get all shifts
export const getShifts = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { date, shiftType, status } = req.query;

    const query = { hospitalId };
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.shiftDate = { $gte: startDate, $lte: endDate };
    }
    if (shiftType) query.shiftType = shiftType;
    if (status) query.status = status;

    const shifts = await DoctorShift.find(query)
      .populate("doctorId", "name email")
      .sort({ shiftDate: 1, startTime: 1 });
    
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a shift
export const createShift = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const shift = new DoctorShift({ ...req.body, hospitalId });
    await shift.save();
    await shift.populate("doctorId", "name email");
    res.status(201).json(shift);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update shift
export const updateShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const shift = await DoctorShift.findByIdAndUpdate(
      shiftId,
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    ).populate("doctorId", "name email");
    
    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }
    
    res.json(shift);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete shift
export const deleteShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const shift = await DoctorShift.findByIdAndDelete(shiftId);
    
    if (!shift) {
      return res.status(404).json({ error: "Shift not found" });
    }
    
    res.json({ message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current active shifts
export const getActiveShifts = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const shifts = await DoctorShift.find({
      hospitalId,
      status: "active",
      shiftDate: {
        $gte: new Date(now.setHours(0, 0, 0, 0)),
        $lte: new Date(now.setHours(23, 59, 59, 999))
      }
    })
      .populate("doctorId", "name email")
      .sort({ startTime: 1 });

    res.json(shifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get shift statistics
export const getShiftStatistics = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { startDate, endDate } = req.query;

    const matchQuery = { hospitalId };
    if (startDate && endDate) {
      matchQuery.shiftDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await DoctorShift.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$shiftType",
          totalShifts: { $sum: 1 },
          activeShifts: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
          },
          completedShifts: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

