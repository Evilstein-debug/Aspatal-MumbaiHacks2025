import AnalyticsLog from "../models/analyticsLog.js";
import mongoose from "mongoose";

// Validation helper
const validateAnalyticsData = (data) => {
  const errors = [];
  
  if (!data.timestamp || !(data.timestamp instanceof Date)) {
    errors.push("Valid timestamp is required");
  }
  if (data.hour === undefined || data.hour < 0 || data.hour > 23) {
    errors.push("Valid hour (0-23) is required");
  }
  if (!data.footfall || typeof data.footfall !== "object") {
    errors.push("Footfall data is required");
  }
  
  return errors;
};

// GET /api/analytics - Get analytics logs
export const getAnalyticsLogs = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { startDate, endDate, hour, groupBy } = req.query;

    const query = { hospitalId };
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.timestamp = { $gte: new Date(startDate) };
    }
    
    if (hour !== undefined) {
      query.hour = parseInt(hour);
    }

    let logs;
    if (groupBy === "hour") {
      logs = await AnalyticsLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: { hour: "$hour", date: "$date" },
            totalFootfall: { $sum: "$footfall.total" },
            avgFootfall: { $avg: "$footfall.total" },
            maxFootfall: { $max: "$footfall.total" },
            minFootfall: { $min: "$footfall.total" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": -1, "_id.hour": 1 } }
      ]);
    } else if (groupBy === "day") {
      logs = await AnalyticsLog.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalFootfall: { $sum: "$footfall.total" },
            avgFootfall: { $avg: "$footfall.total" },
            maxFootfall: { $max: "$footfall.total" },
            minFootfall: { $min: "$footfall.total" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]);
    } else {
      logs = await AnalyticsLog.find(query).sort({ timestamp: -1 }).limit(100);
    }

    res.json({
      success: true,
      count: Array.isArray(logs) ? logs.length : 0,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/analytics/:logId - Get single analytics log
export const getAnalyticsLogById = async (req, res) => {
  try {
    const { logId } = req.params;
    const log = await AnalyticsLog.findById(logId);

    if (!log) {
      return res.status(404).json({ success: false, error: "Analytics log not found" });
    }

    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/analytics - Create analytics log
export const createAnalyticsLog = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const validationErrors = validateAnalyticsData(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors
      });
    }

    const timestamp = new Date(req.body.timestamp);
    const hour = timestamp.getHours();
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);

    // Calculate utilization rate if bed occupancy data provided
    let utilizationRate = null;
    if (req.body.bedOccupancy && req.body.bedOccupancy.total > 0) {
      utilizationRate = (req.body.bedOccupancy.occupied / req.body.bedOccupancy.total) * 100;
    }

    const log = new AnalyticsLog({
      ...req.body,
      hospitalId,
      timestamp,
      hour,
      date,
      bedOccupancy: req.body.bedOccupancy ? {
        ...req.body.bedOccupancy,
        utilizationRate
      } : undefined
    });

    await log.save();

    res.status(201).json({
      success: true,
      message: "Analytics log created successfully",
      data: log
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/analytics/:logId - Update analytics log
export const updateAnalyticsLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const log = await AnalyticsLog.findByIdAndUpdate(
      logId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!log) {
      return res.status(404).json({ success: false, error: "Analytics log not found" });
    }

    res.json({
      success: true,
      message: "Analytics log updated successfully",
      data: log
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/analytics/:logId - Delete analytics log
export const deleteAnalyticsLog = async (req, res) => {
  try {
    const { logId } = req.params;
    const log = await AnalyticsLog.findByIdAndDelete(logId);

    if (!log) {
      return res.status(404).json({ success: false, error: "Analytics log not found" });
    }

    res.json({
      success: true,
      message: "Analytics log deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/analytics/:hospitalId/stats - Get aggregated statistics
export const getAnalyticsStats = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { startDate, endDate } = req.query;

    const matchQuery = { hospitalId };
    if (startDate && endDate) {
      matchQuery.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await AnalyticsLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalFootfall: { $sum: "$footfall.total" },
          avgFootfall: { $avg: "$footfall.total" },
          maxFootfall: { $max: "$footfall.total" },
          minFootfall: { $min: "$footfall.total" },
          totalOPD: { $sum: "$footfall.opd" },
          totalEmergency: { $sum: "$footfall.emergency" },
          avgWaitTimeOPD: { $avg: "$waitTimes.opd.average" },
          avgWaitTimeEmergency: { $avg: "$waitTimes.emergency.average" },
          avgBedUtilization: { $avg: "$bedOccupancy.utilizationRate" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

