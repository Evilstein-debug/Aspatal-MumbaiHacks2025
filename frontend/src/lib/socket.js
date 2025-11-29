import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
const SOCKET_ENABLED =
  (import.meta.env.VITE_ENABLE_SOCKET || "false").toLowerCase() === "true";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isEnabled = SOCKET_ENABLED;
  }

  connect() {
    if (!this.isEnabled) {
      return null;
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("✅ Socket.io connected:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("❌ Socket.io disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.io connection error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinHospital(hospitalId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("join:hospital", hospitalId);
      console.log(`🏥 Joined hospital room: ${hospitalId}`);
    }
  }

  leaveHospital(hospitalId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave:hospital", hospitalId);
      console.log(`🏥 Left hospital room: ${hospitalId}`);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

