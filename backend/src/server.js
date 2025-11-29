import express from "express";
import 'dotenv/config';
import cors from "cors";
import { createServer } from "http";
import connectDB from "./config/db.js";
import { initializeSocket } from "./socket/socketServer.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import bedRoutes from "./routes/bedRoutes.js";
import bedItemRoutes from "./routes/bedItemRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import opdRoutes from "./routes/opdRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import transferRoutes from "./routes/transferRoutes.js";


const port = process.env.PORT || 8000
const allowedOrigins = process.env.CORS_ORIGIN || "http://localhost:5173"

const app = express()
const httpServer = createServer(app)

// Initialize Socket.io
const io = initializeSocket(httpServer)

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

app.use(express.json())

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/beds", bedRoutes); // Bed occupancy routes
app.use("/api/bed-items", bedItemRoutes); // Individual bed CRUD routes
app.use("/api/shifts", shiftRoutes);
app.use("/api/opd", opdRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/transfers", transferRoutes);

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error in express application: ", error)
    })
    httpServer.listen(port, () => {
        console.log("🚀 Server listening on port:", port)
        console.log(`📍 CORS origin: ${allowedOrigins}`)
        console.log("📡 API endpoints available at /api/*")
        console.log("🔌 Socket.io server initialized")
    })
    
})
.catch((error) => {
    console.log("\n❌ MongoDB connection error!", error)
    process.exit(1)
})