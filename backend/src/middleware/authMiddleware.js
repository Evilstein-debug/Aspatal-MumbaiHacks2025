import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided. Authorization required." });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-in-production");

    // Find user and attach to request
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ error: "User not found. Invalid token." });
    }

    // Attach user info to request
    req.userId = user._id.toString();
    req.user = user;
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

// Middleware to check if user has required role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

// Middleware to check if user belongs to hospital (optional)
export const checkHospitalAccess = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const user = req.user;

    // Superadmin can access all hospitals
    if (user.role === "superadmin") {
      return next();
    }

    // Check if user's hospital matches
    if (hospitalId && user.hospitalId) {
      if (user.hospitalId.toString() !== hospitalId) {
        return res.status(403).json({
          error: "Access denied. You can only access your assigned hospital.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Hospital access check error:", error);
    res.status(500).json({ error: "Access check failed" });
  }
};

