const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// GET ALL CATEGORIES
router.get(
  "/",
  protect,
  getAllCategories
);

// ADMIN - ADD CATEGORY
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createCategory
);

// ADMIN - UPDATE CATEGORY
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateCategory
);

// ADMIN - DELETE CATEGORY
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteCategory
);

module.exports = router;