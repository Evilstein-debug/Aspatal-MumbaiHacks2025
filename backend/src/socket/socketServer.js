import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join hospital room for filtered updates
    socket.on("join:hospital", (hospitalId) => {
      socket.join(`hospital:${hospitalId}`);
      console.log(`🏥 Socket ${socket.id} joined hospital: ${hospitalId}`);
    });

    // Leave hospital room
    socket.on("leave:hospital", (hospitalId) => {
      socket.leave(`hospital:${hospitalId}`);
      console.log(`🏥 Socket ${socket.id} left hospital: ${hospitalId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper functions to emit events
export const emitBedOccupancyUpdate = (hospitalId, data) => {
  if (io) {
    io.to(`hospital:${hospitalId}`).emit("bed:occupancy:update", data);
    console.log(`📊 Emitted bed occupancy update for hospital: ${hospitalId}`);
  }
};

export const emitEmergencyCase = (hospitalId, data) => {
  if (io) {
    io.to(`hospital:${hospitalId}`).emit("emergency:new", data);
    // Also emit to all for critical cases
    if (data.triageLevel === "critical") {
      io.emit("emergency:critical", data);
    }
    console.log(`🚨 Emitted emergency case for hospital: ${hospitalId}`);
  }
};

export const emitDoctorShiftChange = (hospitalId, data) => {
  if (io) {
    io.to(`hospital:${hospitalId}`).emit("doctor:shift:change", data);
    console.log(`👨‍⚕️ Emitted doctor shift change for hospital: ${hospitalId}`);
  }
};

export const emitOPDQueueUpdate = (hospitalId, data) => {
  if (io) {
    io.to(`hospital:${hospitalId}`).emit("opd:queue:update", data);
    console.log(`👥 Emitted OPD queue update for hospital: ${hospitalId}`);
  }
};

export const emitAlert = (hospitalId, data) => {
  if (io) {
    if (hospitalId) {
      io.to(`hospital:${hospitalId}`).emit("alert:new", data);
    } else {
      // System-wide alerts
      io.emit("alert:new", data);
    }
    console.log(`🔔 Emitted alert for hospital: ${hospitalId || "system-wide"}`);
  }
};

export default io;

