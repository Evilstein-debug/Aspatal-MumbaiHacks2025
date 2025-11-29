import PatientTransfer from "../models/patientTransfer.js";
import Hospital from "../models/hostpital.js";
import BedOccupancy from "../models/bedOccupancy.js";
import mongoose from "mongoose";

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) {
    return null;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Estimate travel time in minutes (assuming average speed of 40 km/h)
const estimateTravelTime = (distance) => {
  if (!distance) return null;
  const averageSpeed = 40; // km/h
  const timeInHours = distance / averageSpeed;
  return Math.round(timeInHours * 60); // Convert to minutes
};

// Check if hospital is at full capacity for a specific bed type
const isHospitalFull = async (hospitalId, bedType) => {
  const bedOccupancy = await BedOccupancy.findOne({
    hospitalId,
    bedType
  });

  if (!bedOccupancy) {
    return false; // If no record exists, assume not full
  }

  return bedOccupancy.availableBeds <= 0;
};

// Check if hospital is at full capacity for all bed types
export const checkHospitalCapacity = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { bedType } = req.query;

    if (bedType) {
      // Check specific bed type
      const isFull = await isHospitalFull(hospitalId, bedType);
      const bedOccupancy = await BedOccupancy.findOne({
        hospitalId,
        bedType
      });

      return res.json({
        hospitalId,
        bedType,
        isFull,
        bedOccupancy: bedOccupancy || null
      });
    }

    // Check all bed types
    const allBeds = await BedOccupancy.find({ hospitalId });
    const capacityStatus = allBeds.map(bed => ({
      bedType: bed.bedType,
      isFull: bed.availableBeds <= 0,
      totalBeds: bed.totalBeds,
      occupiedBeds: bed.occupiedBeds,
      availableBeds: bed.availableBeds
    }));

    const isAnyFull = capacityStatus.some(status => status.isFull);

    res.json({
      hospitalId,
      isFull: isAnyFull,
      capacityStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Find nearest hospitals with bed availability
export const findAvailableHospitals = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { bedType, maxDistance } = req.query;

    if (!bedType) {
      return res.status(400).json({ 
        error: "bedType is required (general, icu, ventilator, isolation)" 
      });
    }

    // Get current hospital location
    const currentHospital = await Hospital.findById(hospitalId);
    if (!currentHospital) {
      return res.status(404).json({ error: "Hospital not found" });
    }

    if (!currentHospital.location || !currentHospital.location.lat || !currentHospital.location.lng) {
      return res.status(400).json({ 
        error: "Current hospital location not set. Please set lat/lng coordinates." 
      });
    }

    // Get all other hospitals
    const allHospitals = await Hospital.find({
      _id: { $ne: hospitalId }
    });

    // Get bed occupancy for all hospitals
    const bedOccupancies = await BedOccupancy.find({
      bedType,
      availableBeds: { $gt: 0 } // Only hospitals with available beds
    });

    // Create a map of hospitalId to bed occupancy
    const bedMap = new Map();
    bedOccupancies.forEach(bed => {
      bedMap.set(bed.hospitalId.toString(), bed);
    });

    // Calculate distances and filter hospitals
    const availableHospitals = allHospitals
      .map(hospital => {
        if (!hospital.location || !hospital.location.lat || !hospital.location.lng) {
          return null; // Skip hospitals without location
        }

        const bedOccupancy = bedMap.get(hospital._id.toString());
        if (!bedOccupancy) {
          return null; // Skip hospitals without available beds
        }

        const distance = calculateDistance(
          currentHospital.location.lat,
          currentHospital.location.lng,
          hospital.location.lat,
          hospital.location.lng
        );

        if (distance === null) {
          return null;
        }

        // Filter by maxDistance if provided
        if (maxDistance && distance > parseFloat(maxDistance)) {
          return null;
        }

        return {
          hospitalId: hospital._id,
          hospitalName: hospital.name,
          address: hospital.address,
          location: hospital.location,
          distance: distance,
          estimatedTime: estimateTravelTime(distance),
          bedType: bedOccupancy.bedType,
          availableBeds: bedOccupancy.availableBeds,
          totalBeds: bedOccupancy.totalBeds,
          occupiedBeds: bedOccupancy.occupiedBeds
        };
      })
      .filter(hospital => hospital !== null)
      .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)

    res.json({
      currentHospital: {
        id: currentHospital._id,
        name: currentHospital.name,
        location: currentHospital.location
      },
      bedType,
      availableHospitals,
      count: availableHospitals.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a patient transfer request
export const createTransferRequest = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { toHospitalId, patientId, patientName, patientAge, patientGender, bedType, reason, notes } = req.body;

    if (!toHospitalId || !bedType || !patientName) {
      return res.status(400).json({ 
        error: "toHospitalId, bedType, and patientName are required" 
      });
    }

    // Verify both hospitals exist
    const fromHospital = await Hospital.findById(hospitalId);
    const toHospital = await Hospital.findById(toHospitalId);

    if (!fromHospital || !toHospital) {
      return res.status(404).json({ error: "One or both hospitals not found" });
    }

    // Check if destination hospital has available beds
    const bedOccupancy = await BedOccupancy.findOne({
      hospitalId: toHospitalId,
      bedType
    });

    if (!bedOccupancy || bedOccupancy.availableBeds <= 0) {
      return res.status(400).json({ 
        error: `No ${bedType} beds available at destination hospital` 
      });
    }

    // Calculate distance
    let distance = null;
    let estimatedTime = null;

    if (fromHospital.location && toHospital.location) {
      distance = calculateDistance(
        fromHospital.location.lat,
        fromHospital.location.lng,
        toHospital.location.lat,
        toHospital.location.lng
      );
      estimatedTime = estimateTravelTime(distance);
    }

    // Create transfer request
    const transfer = new PatientTransfer({
      fromHospitalId: hospitalId,
      toHospitalId,
      patientId: patientId || null,
      patientName,
      patientAge,
      patientGender,
      bedType,
      reason: reason || "Hospital at full capacity",
      status: "pending",
      requestedBy: req.userId || req.user?._id || null,
      distance,
      estimatedTime,
      notes
    });

    await transfer.save();

    // Populate hospital details
    await transfer.populate("fromHospitalId", "name address");
    await transfer.populate("toHospitalId", "name address");

    res.status(201).json(transfer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all transfer requests for a hospital
export const getTransferRequests = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { status, direction } = req.query; // direction: 'from' or 'to'

    let query = {};

    if (direction === "to") {
      query.toHospitalId = hospitalId;
    } else if (direction === "from") {
      query.fromHospitalId = hospitalId;
    } else {
      // Get both incoming and outgoing transfers
      query.$or = [
        { fromHospitalId: hospitalId },
        { toHospitalId: hospitalId }
      ];
    }

    if (status) {
      query.status = status;
    }

    const transfers = await PatientTransfer.find(query)
      .populate("fromHospitalId", "name address location")
      .populate("toHospitalId", "name address location")
      .populate("patientId", "name age gender")
      .populate("requestedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ requestedAt: -1 });

    res.json(transfers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update transfer status (approve, reject, complete, cancel)
export const updateTransferStatus = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { status, cancellationReason, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    const validStatuses = ["pending", "approved", "rejected", "in_transit", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const transfer = await PatientTransfer.findById(transferId);
    if (!transfer) {
      return res.status(404).json({ error: "Transfer request not found" });
    }

    const updateData = { status };

    if (status === "approved") {
      updateData.approvedBy = req.userId || req.user?._id || null;
      updateData.approvedAt = new Date();

      // Reserve a bed at destination hospital
      const bedOccupancy = await BedOccupancy.findOne({
        hospitalId: transfer.toHospitalId,
        bedType: transfer.bedType
      });

      if (bedOccupancy && bedOccupancy.availableBeds > 0) {
        bedOccupancy.reservedBeds = (bedOccupancy.reservedBeds || 0) + 1;
        bedOccupancy.availableBeds = bedOccupancy.availableBeds - 1;
        await bedOccupancy.save();
      }
    }

    if (status === "completed") {
      updateData.completedAt = new Date();

      // Update bed occupancy at destination hospital
      const bedOccupancy = await BedOccupancy.findOne({
        hospitalId: transfer.toHospitalId,
        bedType: transfer.bedType
      });

      if (bedOccupancy) {
        bedOccupancy.occupiedBeds = (bedOccupancy.occupiedBeds || 0) + 1;
        bedOccupancy.reservedBeds = Math.max(0, (bedOccupancy.reservedBeds || 0) - 1);
        bedOccupancy.availableBeds = bedOccupancy.totalBeds - bedOccupancy.occupiedBeds - bedOccupancy.reservedBeds;
        await bedOccupancy.save();
      }

      // Update bed occupancy at source hospital (if patient was occupying a bed)
      const sourceBedOccupancy = await BedOccupancy.findOne({
        hospitalId: transfer.fromHospitalId,
        bedType: transfer.bedType
      });

      if (sourceBedOccupancy && sourceBedOccupancy.occupiedBeds > 0) {
        sourceBedOccupancy.occupiedBeds = sourceBedOccupancy.occupiedBeds - 1;
        sourceBedOccupancy.availableBeds = sourceBedOccupancy.totalBeds - sourceBedOccupancy.occupiedBeds - sourceBedOccupancy.reservedBeds;
        await sourceBedOccupancy.save();
      }
    }

    if (status === "cancelled" || status === "rejected") {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = cancellationReason || notes || "No reason provided";

      // If it was approved, release the reserved bed
      if (transfer.status === "approved") {
        const bedOccupancy = await BedOccupancy.findOne({
          hospitalId: transfer.toHospitalId,
          bedType: transfer.bedType
        });

        if (bedOccupancy && bedOccupancy.reservedBeds > 0) {
          bedOccupancy.reservedBeds = bedOccupancy.reservedBeds - 1;
          bedOccupancy.availableBeds = bedOccupancy.availableBeds + 1;
          await bedOccupancy.save();
        }
      }
    }

    if (notes) {
      updateData.notes = notes;
    }

    const updatedTransfer = await PatientTransfer.findByIdAndUpdate(
      transferId,
      updateData,
      { new: true }
    )
      .populate("fromHospitalId", "name address location")
      .populate("toHospitalId", "name address location")
      .populate("patientId", "name age gender")
      .populate("requestedBy", "name email")
      .populate("approvedBy", "name email");

    res.json(updatedTransfer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transfer statistics
export const getTransferStatistics = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { startDate, endDate } = req.query;

    const matchQuery = {
      $or: [
        { fromHospitalId: hospitalId },
        { toHospitalId: hospitalId }
      ]
    };

    if (startDate && endDate) {
      matchQuery.requestedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await PatientTransfer.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const bedTypeStats = await PatientTransfer.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$bedType",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      bedTypeStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

