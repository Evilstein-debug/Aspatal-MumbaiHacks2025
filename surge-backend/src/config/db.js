const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in environment variables");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  });

  console.log("✅ Surge forecasting MongoDB connected");
};

module.exports = connectDB;


