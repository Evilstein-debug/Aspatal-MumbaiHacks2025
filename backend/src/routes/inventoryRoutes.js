import express from "express";
import {
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  restockInventory,
  getLowStockItems
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/:hospitalId", getAllInventory);
router.get("/:hospitalId/low-stock", getLowStockItems);
router.get("/item/:itemId", getInventoryById);
router.post("/:hospitalId", createInventory);
router.put("/item/:itemId", updateInventory);
router.put("/item/:itemId/restock", restockInventory);
router.delete("/item/:itemId", deleteInventory);

export default router;

