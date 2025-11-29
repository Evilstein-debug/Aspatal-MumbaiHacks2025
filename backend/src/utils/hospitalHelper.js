import mongoose from "mongoose";
import Hospital from "../models/hostpital.js";

let cachedDefaultHospitalId = null;

export const resolveHospitalId = async (hospitalId) => {
  const defaultName =
    process.env.DEFAULT_HOSPITAL_NAME || "Demo Hospital (Auto)";

  if (
    hospitalId &&
    hospitalId !== "default" &&
    mongoose.Types.ObjectId.isValid(hospitalId)
  ) {
    return hospitalId;
  }

  if (cachedDefaultHospitalId) {
    return cachedDefaultHospitalId;
  }

  let hospital = await Hospital.findOne({ name: defaultName });

  if (!hospital) {
    hospital = await Hospital.create({
      name: defaultName,
      address: process.env.DEFAULT_HOSPITAL_ADDRESS || "Demo Address",
      totalBeds: 200,
      availableBeds: 120,
      totalICU: 40,
      availableICU: 25,
      resources: [
        { type: "oxygen", total: 100, available: 80 },
        { type: "ventilator", total: 20, available: 15 }
      ]
    });
  }

  cachedDefaultHospitalId = hospital._id.toString();
  return cachedDefaultHospitalId;
};


