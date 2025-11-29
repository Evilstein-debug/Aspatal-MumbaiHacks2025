require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const predictionRoutes = require("./routes/predictionRoutes");

const app = express();
const port = process.env.PORT || 9000;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

app.use(express.json());

app.get("/api/surge/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/surge", predictionRoutes);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Surge forecasting service running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Mongo connection failed", error);
    process.exit(1);
  });


