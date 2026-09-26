const express = require("express");

const {
  createFarmerProfile,
  getMyFarmerProfile,
  addMarketToFarmer,
  getAllFarmers,
  updateFarmerProfile,
  getFarmerReviews,
  getFarmerStock
} = require("../controllers/farmerController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/profile",
  protect,
  authorizeRoles("farmer"),
  createFarmerProfile
);

// Get my farmer profile
router.get(
  "/profile",
  protect,
  authorizeRoles("farmer"),
  getMyFarmerProfile
);

// Update my farmer profile
router.put(
  "/profile",
  protect,
  authorizeRoles("farmer"),
  updateFarmerProfile
);

// Add market to my profile
router.put(
  "/profile/market",
  protect,
  authorizeRoles("farmer"),
  addMarketToFarmer
);

// ============================================================
// PUBLIC FARMER ROUTES
// ============================================================

// Get all farmers
router.get(
  "/",
  getAllFarmers
);

// Get farmer stock
router.get(
  "/:id/stock",
  getFarmerStock
);

// Get farmer reviews
router.get(
  "/:id/reviews",
  getFarmerReviews
);

module.exports = router;