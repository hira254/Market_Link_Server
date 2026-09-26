const express = require("express");

const {
  createProduct,
  getAllProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  adminDeleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ============================================================
// ADMIN ROUTES
// ============================================================

router.delete(
  "/admin/:id",
  protect,
  authorizeRoles("admin"),
  adminDeleteProduct
);

// ============================================================
// FARMER ROUTES
// ============================================================

// Create product
router.post(
  "/",
  protect,
  authorizeRoles("farmer"),
  createProduct
);

// Get my products
// IMPORTANT: /my must come before /:id
router.get(
  "/my",
  protect,
  authorizeRoles("farmer"),
  getMyProducts
);

// Update product
router.put(
  "/:id",
  protect,
  authorizeRoles("farmer"),
  updateProduct
);

// Delete product
router.delete(
  "/:id",
  protect,
  authorizeRoles("farmer"),
  deleteProduct
);

// ============================================================
// PUBLIC PRODUCT ROUTES
// ============================================================

// Get all products
router.get(
  "/",
  getAllProducts
);

// Get single product
router.get(
  "/:id",
  getProductById
);

module.exports = router;