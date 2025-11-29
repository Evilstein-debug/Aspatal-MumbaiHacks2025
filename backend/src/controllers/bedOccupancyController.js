import BedOccupancy from "../models/bedOccupancy.js";
import mongoose from "mongoose";
import { emitBedOccupancyUpdate } from "../socket/socketServer.js";
import { resolveHospitalId } from "../utils/hospitalHelper.js";

const getMatchStage = (hospitalId) => {
  if (mongoose.Types.ObjectId.isValid(hospitalId)) {
    return { hospitalId: new mongoose.Types.ObjectId(hospitalId) };
  }
  return null;
};

const computeSummaryFromBeds = (beds = []) => {
  return beds.reduce(
    (acc, bed) => ({
      totalBeds: acc.totalBeds + (bed.totalBeds || 0),
      occupiedBeds: acc.occupiedBeds + (bed.occupiedBeds || 0),
      availableBeds: acc.availableBeds + (bed.availableBeds || 0)
    }),
    { totalBeds: 0, occupiedBeds: 0, availableBeds: 0 }
  );
};

// Get all bed occupancies for a hospital
export const getBedOccupancy = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const beds = await BedOccupancy.find({ hospitalId }).sort({ bedType: 1 });
    res.json(beds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get real-time bed occupancy
export const getRealTimeBedOccupancy = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const beds = await BedOccupancy.find({ hospitalId })
      .sort({ lastUpdated: -1 })
      .limit(10);

    let summaryData = {};
    const matchStage = getMatchStage(hospitalId);

    if (matchStage) {
      const summary = await BedOccupancy.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalBeds: { $sum: "$totalBeds" },
            occupiedBeds: { $sum: "$occupiedBeds" },
            availableBeds: { $sum: "$availableBeds" }
          }
        }
      ]);
      summaryData = summary[0] || {};
    } else {
      summaryData = computeSummaryFromBeds(beds);
    }

    res.json({ beds, summary: summaryData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update bed occupancy
export const updateBedOccupancy = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const { bedType } = req.params;
    const { totalBeds, occupiedBeds, reservedBeds } = req.body;

    const availableBeds = totalBeds - occupiedBeds - (reservedBeds || 0);

    const bed = await BedOccupancy.findOneAndUpdate(
      { hospitalId, bedType },
      {
        totalBeds,
        occupiedBeds,
        availableBeds,
        reservedBeds: reservedBeds || 0,
        lastUpdated: new Date()
      },
      { new: true, upsert: true }
    );

    // Emit socket event for real-time update
    emitBedOccupancyUpdate(hospitalId, bed);

    res.json(bed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create bed occupancy record
export const createBedOccupancy = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const bed = new BedOccupancy({ ...req.body, hospitalId });
    await bed.save();
    res.status(201).json(bed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bed occupancy statistics
export const getBedStatistics = async (req, res) => {
  try {
    const hospitalId = await resolveHospitalId(req.params.hospitalId);
    const matchStage = getMatchStage(hospitalId);
    let stats = [];

    if (matchStage) {
      stats = await BedOccupancy.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$bedType",
            totalBeds: { $sum: "$totalBeds" },
            occupiedBeds: { $sum: "$occupiedBeds" },
            availableBeds: { $sum: "$availableBeds" },
            utilizationRate: {
              $avg: {
                $multiply: [
                  { $divide: ["$occupiedBeds", "$totalBeds"] },
                  100
                ]
              }
            }
          }
        }
      ]);
    } else {
      const beds = await BedOccupancy.find({ hospitalId });
      const grouped = beds.reduce((acc, bed) => {
        if (!acc[bed.bedType]) {
          acc[bed.bedType] = {
            _id: bed.bedType,
            totalBeds: 0,
            occupiedBeds: 0,
            availableBeds: 0
          };
        }
        acc[bed.bedType].totalBeds += bed.totalBeds || 0;
        acc[bed.bedType].occupiedBeds += bed.occupiedBeds || 0;
        acc[bed.bedType].availableBeds += bed.availableBeds || 0;
        return acc;
      }, {});

      stats = Object.values(grouped).map((item) => ({
        ...item,
        utilizationRate: item.totalBeds
          ? (item.occupiedBeds / item.totalBeds) * 100
          : 0
      }));
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

