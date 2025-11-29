const mongoose = require("mongoose");

const HospitalStatSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: String,
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    patientCount: {
      type: Number,
      required: true
    },
    icuUsage: {
      type: Number,
      required: true
    },
    oxygenConsumption: {
      type: Number,
      required: true
    },
    aqi: {
      type: Number,
      required: true
    },
    isFestivalDay: {
      type: Boolean,
      default: false
    },
    festivalName: {
      type: String,
      default: ""
    },
    isWeekend: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

HospitalStatSchema.index({ hospitalId: 1, date: -1 });
HospitalStatSchema.index({ hospitalId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("HospitalStat", HospitalStatSchema);

