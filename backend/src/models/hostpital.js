import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  type: { type: String, required: true }, // oxygen, ventilator, PPE kits
  total: { type: Number, required: true },
  available: { type: Number, required: true }
});

const dutyStaffSchema = new mongoose.Schema({
  staffId: String,
  name: String,
  role: String, // doctor, nurse, etc.
  shift: String, // morning, evening, night
});

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  location: {
    lat: Number,
    lng: Number
  },
  totalBeds: Number,
  availableBeds: Number,
  totalICU: Number,
  availableICU: Number,

  resources: [resourceSchema],
  dutyStaff: [dutyStaffSchema],

  ambulances: {
    total: Number,
    available: Number
  },

  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("Hospital", hospitalSchema);