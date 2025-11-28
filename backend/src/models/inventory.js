import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ["oxygen", "medicine", "equipment", "supplies", "ppe", "blood", "other"],
    required: true
  },
  itemCode: {
    type: String,
    required: true,
    trim: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ["liters", "units", "boxes", "bottles", "packs", "bags", "cylinders", "vials", "tablets", "kg", "grams"],
    default: "units"
  },
  minThreshold: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  maxCapacity: {
    type: Number,
    min: 0
  },
  reorderLevel: {
    type: Number,
    min: 0
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  expiryDate: Date,
  batchNumber: String,
  location: String, // Storage location
  costPerUnit: Number,
  lastRestocked: Date,
  lastUsed: Date,
  usageRate: Number, // Units per day
  notes: String,
  status: {
    type: String,
    enum: ["available", "low_stock", "out_of_stock", "expired", "quarantine"],
    default: "available"
  }
}, {
  timestamps: true
});

// Indexes
inventoryItemSchema.index({ hospitalId: 1, itemCode: 1 }, { unique: true });
inventoryItemSchema.index({ hospitalId: 1, category: 1 });
inventoryItemSchema.index({ hospitalId: 1, status: 1 });
inventoryItemSchema.index({ currentStock: 1 });

// Virtual for stock status
inventoryItemSchema.virtual("stockStatus").get(function() {
  if (this.currentStock === 0) return "out_of_stock";
  if (this.currentStock <= this.minThreshold) return "low_stock";
  return "available";
});

export default mongoose.model("Inventory", inventoryItemSchema);

