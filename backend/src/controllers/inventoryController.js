import Inventory from "../models/inventory.js";
import mongoose from "mongoose";

// Validation helper
const validateInventoryData = (data) => {
  const errors = [];
  
  if (!data.itemName || data.itemName.trim() === "") {
    errors.push("Item name is required");
  }
  if (!data.category || !["oxygen", "medicine", "equipment", "supplies", "ppe", "blood", "other"].includes(data.category)) {
    errors.push("Valid category is required");
  }
  if (!data.itemCode || data.itemCode.trim() === "") {
    errors.push("Item code is required");
  }
  if (data.currentStock === undefined || data.currentStock < 0) {
    errors.push("Valid current stock is required");
  }
  if (!data.unit || !["liters", "units", "boxes", "bottles", "packs", "bags", "cylinders", "vials", "tablets", "kg", "grams"].includes(data.unit)) {
    errors.push("Valid unit is required");
  }
  if (data.minThreshold === undefined || data.minThreshold < 0) {
    errors.push("Valid minimum threshold is required");
  }
  
  return errors;
};

// GET /api/inventory - Get all inventory items
export const getAllInventory = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { category, status, lowStock } = req.query;

    const query = { hospitalId };
    if (category) query.category = category;
    if (status) query.status = status;
    if (lowStock === "true") {
      query.$expr = { $lte: ["$currentStock", "$minThreshold"] };
    }

    const items = await Inventory.find(query).sort({ itemName: 1 });

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/inventory/:itemId - Get single item
export const getInventoryById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Inventory.findById(itemId);

    if (!item) {
      return res.status(404).json({ success: false, error: "Inventory item not found" });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/inventory - Create new inventory item
export const createInventory = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const validationErrors = validateInventoryData(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors
      });
    }

    // Check if item code already exists
    const existingItem = await Inventory.findOne({
      hospitalId,
      itemCode: req.body.itemCode
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        error: "Item code already exists in this hospital"
      });
    }

    // Auto-calculate status based on stock
    const currentStock = req.body.currentStock || 0;
    const minThreshold = req.body.minThreshold || 10;
    let status = "available";
    if (currentStock === 0) status = "out_of_stock";
    else if (currentStock <= minThreshold) status = "low_stock";

    const item = new Inventory({
      ...req.body,
      hospitalId,
      status
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: item
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/inventory/:itemId - Update inventory item
export const updateInventory = async (req, res) => {
  try {
    const { itemId } = req.params;
    const validationErrors = validateInventoryData(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors
      });
    }

    // Auto-update status based on stock
    const currentStock = req.body.currentStock;
    const item = await Inventory.findById(itemId);
    if (item && currentStock !== undefined) {
      if (currentStock === 0) req.body.status = "out_of_stock";
      else if (currentStock <= (req.body.minThreshold || item.minThreshold)) {
        req.body.status = "low_stock";
      } else {
        req.body.status = "available";
      }
      
      if (currentStock > (item.currentStock || 0)) {
        req.body.lastRestocked = new Date();
      } else if (currentStock < (item.currentStock || 0)) {
        req.body.lastUsed = new Date();
      }
    }

    const updatedItem = await Inventory.findByIdAndUpdate(
      itemId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: "Inventory item not found" });
    }

    res.json({
      success: true,
      message: "Inventory item updated successfully",
      data: updatedItem
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/inventory/:itemId - Delete inventory item
export const deleteInventory = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Inventory.findByIdAndDelete(itemId);

    if (!item) {
      return res.status(404).json({ success: false, error: "Inventory item not found" });
    }

    res.json({
      success: true,
      message: "Inventory item deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/inventory/:itemId/restock - Restock inventory
export const restockInventory = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, costPerUnit, supplier } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid quantity is required"
      });
    }

    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: "Inventory item not found" });
    }

    item.currentStock += quantity;
    if (costPerUnit) item.costPerUnit = costPerUnit;
    if (supplier) item.supplier = { ...item.supplier, ...supplier };
    item.lastRestocked = new Date();
    
    // Update status
    if (item.currentStock === 0) item.status = "out_of_stock";
    else if (item.currentStock <= item.minThreshold) item.status = "low_stock";
    else item.status = "available";

    await item.save();

    res.json({
      success: true,
      message: "Inventory restocked successfully",
      data: item
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/inventory/:hospitalId/low-stock - Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const items = await Inventory.find({
      hospitalId,
      $expr: { $lte: ["$currentStock", "$minThreshold"] }
    }).sort({ currentStock: 1 });

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

