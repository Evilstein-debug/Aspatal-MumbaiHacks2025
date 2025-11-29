import Bed from "../models/bed.js";
import BedOccupancy from "../models/bedOccupancy.js";
import mongoose from "mongoose";
import { resolveHospitalId } from "../utils/hospitalHelper.js";

// Validation helper
const validateBedData = (data) => {
  const errors = [];
  
  if (!data.bedNumber || data.bedNumber.trim() === "") {
    errors.push("Bed number is required");
  }
  if (!data.bedType || !["general", "icu", "ventilator", "isolation", "private", "semi-private"].includes(data.bedType)) {
    errors.push("Valid bed type is required");
  }
  if (!data.status || !["available", "occupied", "reserved", "maintenance", "cleaning"].includes(data.status)) {
    errors.push("Valid status is required");
  }
  if (!data.ward || data.ward.trim() === "") {
    errors.push("Ward is required");
  }
  
  return errors;
};

const syncBedOccupancy = async (hospitalId, bedType) => {
  const hospitalObjectId = new mongoose.Types.ObjectId(hospitalId);
  const match = { hospitalId: hospitalObjectId };
  if (bedType) {
    match.bedType = bedType;
  }

  const stats = await Bed.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$bedType",
        totalBeds: { $sum: 1 },
        occupiedBeds: {
          $sum: {
            $cond: [{ $eq: ["$status", "occupied"] }, 1, 0]
          }
        },
        reservedBeds: {
          $sum: {
            $cond: [{ $in: ["$status", ["reserved", "maintenance"]] }, 1, 0]
          }
        }
      }
    }
  ]);

  const processedTypes = new Set();

  await Promise.all(
    stats.map(async (stat) => {
      processedTypes.add(stat._id);
      const availableBeds =
        stat.totalBeds - stat.occupiedBeds - stat.reservedBeds;

      await BedOccupancy.findOneAndUpdate(
        { hospitalId: hospitalObjectId, bedType: stat._id },
        {
          totalBeds: stat.totalBeds,
          occupiedBeds: stat.occupiedBeds,
          reservedBeds: stat.reservedBeds,
          availableBeds: Math.max(availableBeds, 0),
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    })
  );

  // If a specific bedType was requested but now has zero beds, remove its occupancy record
  if (bedType && !processedTypes.has(bedType)) {
    await BedOccupancy.findOneAndDelete({
      hospitalId: hospitalObjectId,
      bedType
    });
  }
};

// GET /api/beds - Get all beds (with filters)
export const getAllBeds = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const { status, bedType, ward, floor } = req.query;

    const query = { hospitalId };
    if (status) query.status = status;
    if (bedType) query.bedType = bedType;
    if (ward) query.ward = ward;
    if (floor) query.floor = parseInt(floor);

    const beds = await Bed.find(query)
      .populate("patientId", "name age")
      .populate("assignedNurseId", "name email")
      .sort({ bedNumber: 1 });

    res.json({
      success: true,
      count: beds.length,
      data: beds
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/beds/:bedId - Get single bed
export const getBedById = async (req, res) => {
  try {
    const { bedId } = req.params;
    const bed = await Bed.findById(bedId)
      .populate("patientId")
      .populate("assignedNurseId", "name email");

    if (!bed) {
      return res.status(404).json({ success: false, error: "Bed not found" });
    }

    res.json({ success: true, data: bed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/beds - Create new bed
export const createBed = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const validationErrors = validateBedData(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors
      });
    }

    // Check if bed number already exists
    const existingBed = await Bed.findOne({
      hospitalId,
      bedNumber: req.body.bedNumber
    });

    if (existingBed) {
      return res.status(400).json({
        success: false,
        error: "Bed number already exists in this hospital"
      });
    }

    const bed = new Bed({
      ...req.body,
      hospitalId
    });

    await bed.save();
    await bed.populate("assignedNurseId", "name email");

    await syncBedOccupancy(hospitalId, bed.bedType);

    res.status(201).json({
      success: true,
      message: "Bed created successfully",
      data: bed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/beds/:bedId - Update bed
export const updateBed = async (req, res) => {
  try {
    const { bedId } = req.params;
    const validationErrors = validateBedData(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors
      });
    }

    const existingBed = await Bed.findById(bedId);
    if (!existingBed) {
      return res
        .status(404)
        .json({ success: false, error: "Bed not found" });
    }

    const previousBedType = existingBed.bedType;

    Object.assign(existingBed, req.body, { lastUpdated: new Date() });
    await existingBed.save();
    await existingBed.populate("patientId");
    await existingBed.populate("assignedNurseId", "name email");

    const hospitalId = existingBed.hospitalId.toString();
    await syncBedOccupancy(hospitalId, existingBed.bedType);
    if (previousBedType !== existingBed.bedType) {
      await syncBedOccupancy(hospitalId, previousBedType);
    }

    res.json({
      success: true,
      message: "Bed updated successfully",
      data: existingBed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/beds/:bedId - Delete bed
export const deleteBed = async (req, res) => {
  try {
    const { bedId } = req.params;
    const bed = await Bed.findById(bedId);

    if (!bed) {
      return res
        .status(404)
        .json({ success: false, error: "Bed not found" });
    }

    if (bed.status === "occupied") {
      return res.status(400).json({
        success: false,
        error: "Cannot delete bed that is currently occupied"
      });
    }

    await Bed.findByIdAndDelete(bedId);
    await syncBedOccupancy(bed.hospitalId.toString(), bed.bedType);

    res.json({
      success: true,
      message: "Bed deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/beds/:hospitalId/available - Get available beds
export const getAvailableBeds = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const { bedType } = req.query;

    const query = { hospitalId, status: "available" };
    if (bedType) query.bedType = bedType;

    const beds = await Bed.find(query).sort({ bedNumber: 1 });

    res.json({
      success: true,
      count: beds.length,
      data: beds
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

