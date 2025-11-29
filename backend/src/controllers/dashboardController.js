import mongoose from "mongoose";
import BedOccupancy from "../models/bedOccupancy.js";
import Doctor from "../models/doctor.js";
import Patient from "../models/patient.js";
import EmergencyCase from "../models/emergencyCase.js";
import Alert from "../models/alert.js";
import Inventory from "../models/inventory.js";

/**
 * GET /api/dashboard/:hospitalId/overview
 * Returns comprehensive dashboard overview data
 */
export const getDashboardOverview = async (req, res) => {
  const { hospitalId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
    return res.status(400).json({ error: "Invalid hospital ID" });
  }

  try {
    // Fetch bed occupancy summary
    const bedData = await BedOccupancy.find({ hospitalId }).lean();
    const bedSummary = {
      total: bedData.reduce((sum, bed) => sum + bed.totalBeds, 0),
      occupied: bedData.reduce((sum, bed) => sum + bed.occupiedBeds, 0),
      available: bedData.reduce((sum, bed) => sum + bed.availableBeds, 0),
      byType: bedData.map(bed => ({
        type: bed.wardType,
        total: bed.totalBeds,
        occupied: bed.occupiedBeds,
        available: bed.availableBeds,
        occupancyRate: ((bed.occupiedBeds / bed.totalBeds) * 100).toFixed(1)
      }))
    };

    // Fetch doctor availability
    const doctors = await Doctor.find({ hospitalId }).lean();
    const doctorSummary = {
      total: doctors.length,
      onDuty: doctors.filter(d => d.status === "on_duty").length,
      offDuty: doctors.filter(d => d.status === "off_duty").length,
      onLeave: doctors.filter(d => d.status === "on_leave").length,
      bySpecialization: doctors.reduce((acc, doc) => {
        acc[doc.specialization] = (acc[doc.specialization] || 0) + 1;
        return acc;
      }, {})
    };

    // Fetch OPD patient counts
    const opdPatients = await Patient.find({ 
      hospitalId,
      patientType: "opd",
      status: { $in: ["waiting", "consulting"] }
    }).lean();

    // Fetch emergency cases (last 24 hours)
    const emergencyCases = await EmergencyCase.find({
      hospitalId,
      arrivalTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).lean();

    const emergencySummary = {
      total: emergencyCases.length,
      critical: emergencyCases.filter(c => c.triageLevel === "critical").length,
      urgent: emergencyCases.filter(c => c.triageLevel === "urgent").length,
      moderate: emergencyCases.filter(c => c.triageLevel === "moderate").length,
      minor: emergencyCases.filter(c => c.triageLevel === "minor").length
    };

    // Fetch active alerts
    const activeAlerts = await Alert.find({
      hospitalId,
      status: "active"
    })
      .sort({ severity: -1, createdAt: -1 })
      .limit(5)
      .lean();

    // Fetch low stock inventory items
    const lowStockItems = await Inventory.find({
      hospitalId,
      $expr: { $lte: ["$currentStock", "$minThreshold"] }
    })
      .sort({ currentStock: 1 })
      .limit(5)
      .lean();

    // Build response
    const response = {
      hospitalId,
      timestamp: new Date().toISOString(),
      beds: bedSummary,
      doctors: doctorSummary,
      opd: {
        waiting: opdPatients.filter(p => p.status === "waiting").length,
        consulting: opdPatients.filter(p => p.status === "consulting").length,
        total: opdPatients.length
      },
      emergency: emergencySummary,
      alerts: activeAlerts,
      inventory: {
        lowStock: lowStockItems.length,
        items: lowStockItems
      }
    };

    return res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error("getDashboardOverview error:", error);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch dashboard data" 
    });
  }
};

export default { getDashboardOverview };