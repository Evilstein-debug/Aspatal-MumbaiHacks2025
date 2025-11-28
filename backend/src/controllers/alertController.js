import Alert from "../models/alert.js";
import mongoose from "mongoose";

// Validation helper
const validateAlertData = (data) => {
  const errors = [];
  
  if (!data.alertType || !["pollution", "festival_surge", "emergency", "inventory_low", "bed_shortage", "staff_shortage", "system"].includes(data.alertType)) {
    errors.push("Valid alert type is required");
  }
  if (!data.severity || !["low", "medium", "high", "critical"].includes(data.severity)) {
    errors.push("Valid severity is required");
  }
  if (!data.title || data.title.trim() === "") {
    errors.push("Title is required");
  }
  if (!data.message || data.message.trim() === "") {
    errors.push("Message is required");
  }
  
  return errors;
};

// GET /api/alerts - Get all alerts
export const getAllAlerts = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { alertType, severity, status, startDate, endDate } = req.query;

    const query = { hospitalId: hospitalId || { $exists: true } };
    if (alertType) query.alertType = alertType;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const alerts = await Alert.find(query)
      .populate("acknowledgedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/alerts/:alertId - Get single alert
export const getAlertById = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await Alert.findById(alertId)
      .populate("acknowledgedBy", "name email");

    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/alerts - Create new alert
export const createAlert = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const validationErrors = validateAlertData(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors
      });
    }

    const alert = new Alert({
      ...req.body,
      hospitalId: hospitalId || null
    });

    await alert.save();

    res.status(201).json({
      success: true,
      message: "Alert created successfully",
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/alerts/:alertId - Update alert
export const updateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      req.body,
      { new: true, runValidators: true }
    ).populate("acknowledgedBy", "name email");

    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }

    res.json({
      success: true,
      message: "Alert updated successfully",
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/alerts/:alertId - Delete alert
export const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await Alert.findByIdAndDelete(alertId);

    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }

    res.json({
      success: true,
      message: "Alert deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/alerts/:alertId/acknowledge - Acknowledge alert
export const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { userId } = req.body; // In production, get from auth middleware

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        status: "acknowledged",
        acknowledgedBy: userId,
        acknowledgedAt: new Date()
      },
      { new: true }
    ).populate("acknowledgedBy", "name email");

    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }

    res.json({
      success: true,
      message: "Alert acknowledged successfully",
      data: alert
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/alerts/:hospitalId/active - Get active alerts
export const getActiveAlerts = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const alerts = await Alert.find({
      hospitalId: hospitalId || { $exists: true },
      status: "active"
    })
      .sort({ severity: -1, createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

