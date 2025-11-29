require("dotenv").config();
const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");
const { createObjectCsvWriter } = require("csv-writer");
const connectDB = require("../src/config/db");
const HospitalStat = require("../src/models/HospitalStat");
const { BASE_FESTIVALS } = require("../src/utils/festivalCalendar");

const hospitalId = process.env.DEFAULT_HOSPITAL_ID || "aspatal-mumbai";
const OUTPUT_PATH = path.join(__dirname, "..", "data", "hospital_history.csv");

const buildFestivalMap = () => {
  const currentYear = dayjs().year();
  const dates = {};

  BASE_FESTIVALS.forEach((festival) => {
    dates[`${festival.monthDay}-${currentYear}`] = festival.name;
    dates[`${festival.monthDay}-${currentYear - 1}`] = festival.name;
    dates[`${festival.monthDay}-${currentYear + 1}`] = festival.name;
  });

  return dates;
};

const festivalMap = buildFestivalMap();

const generateDaySample = (date, previousPatients) => {
  const weekday = date.day();
  const dateKey = `${date.format("MM-DD")}-${date.year()}`;
  const isWeekend = weekday === 0 || weekday === 6;

  let patientCount = previousPatients || 240 + Math.random() * 40;
  patientCount += (Math.random() - 0.5) * 30; // natural variation

  const pollutionSpike = Math.random() > 0.88;
  let aqi = 120 + Math.random() * 70;

  if (pollutionSpike) {
    aqi += 120 + Math.random() * 80;
    patientCount += 35 + Math.random() * 30;
  }

  const festivalName = festivalMap[dateKey];
  const isFestivalDay = Boolean(festivalName);

  if (isFestivalDay) {
    patientCount += 60 + Math.random() * 40;
    aqi += 30;
  }

  if (isWeekend) {
    patientCount -= 25 + Math.random() * 15;
  }

  if (date.day() === 3 && Math.random() > 0.7) {
    patientCount += 15; // mid-week OPD push
  }

  patientCount = Math.max(140, patientCount);
  aqi = Math.min(380, aqi);

  const icuUsage = Math.round(patientCount * (0.18 + Math.random() * 0.08));
  const oxygenConsumption = Math.round(patientCount * 1.2 + aqi * 0.8);

  const notes = [
    pollutionSpike ? "City pollution spike" : null,
    isFestivalDay ? `${festivalName} crowd control` : null,
    isWeekend ? "Weekend elective dip" : null
  ]
    .filter(Boolean)
    .join("; ");

  return {
    hospitalId,
    date: date.toDate(),
    patientCount: Math.round(patientCount),
    icuUsage,
    oxygenConsumption,
    aqi: Math.round(aqi),
    isFestivalDay,
    festivalName: festivalName || "",
    isWeekend,
    notes
  };
};

const generateHistory = (days = 30) => {
  const history = [];
  let previousPatients = 240;

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = dayjs().startOf("day").subtract(i, "day");
    const sample = generateDaySample(date, previousPatients);
    history.push(sample);
    previousPatients = sample.patientCount;
  }

  return history;
};

const writeCsv = async (records) => {
  const csvWriter = createObjectCsvWriter({
    path: OUTPUT_PATH,
    header: [
      { id: "date", title: "date" },
      { id: "patientCount", title: "patient_count" },
      { id: "icuUsage", title: "icu_usage" },
      { id: "oxygenConsumption", title: "oxygen_consumption" },
      { id: "aqi", title: "aqi" },
      { id: "isFestivalDay", title: "festival_day" },
      { id: "festivalName", title: "festival_name" },
      { id: "isWeekend", title: "weekend" },
      { id: "notes", title: "notes" }
    ]
  });

  const formatted = records.map((record) => ({
    ...record,
    date: dayjs(record.date).format("YYYY-MM-DD")
  }));

  await csvWriter.writeRecords(formatted);
  console.log(`📄 CSV exported to ${OUTPUT_PATH}`);
};

const seedDatabase = async () => {
  await connectDB();

  const data = generateHistory(30);

  await HospitalStat.deleteMany({
    hospitalId,
    date: { $gte: dayjs().subtract(60, "day").toDate() }
  });

  await HospitalStat.insertMany(data);
  await writeCsv(data);

  console.log(`✅ Inserted ${data.length} daily records for ${hospitalId}`);
  process.exit(0);
};

seedDatabase().catch((error) => {
  console.error("Seeding failed", error);
  process.exit(1);
});

