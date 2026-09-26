const express = require("express");

const {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's cart
router.get("/", protect, getMyCart);

// Add product to cart
router.post("/add", protect, addToCart);

// Update cart item quantity
router.put("/update/:id", protect, updateCartItem);

// Remove item from cart
router.delete("/remove/:id", protect, removeFromCart);

// Clear entire cart
router.delete("/clear", protect, clearCart);

module.exports = router;