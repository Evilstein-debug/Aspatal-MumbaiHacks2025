import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: String,

  role: {
    type: String,
    enum: ["superadmin", "hospitalAdmin", "doctor", "nurse", "operator"],
    default: "operator"
  },

  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital"
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);