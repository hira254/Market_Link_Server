const express = require("express");

const {
  createMarket,
  getAllMarkets,
  getMarketById,
  getFarmersByMarket,
  deleteMarket,
  updateMarket
} = require("../controllers/marketController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ADMIN - CREATE MARKET
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createMarket
);

// PUBLIC - VIEW ALL ACTIVE MARKETS
router.get(
  "/",
  getAllMarkets
);

// CUSTOMER - VIEW FARMERS BY MARKET
router.get(
  "/:id/farmers",
  protect,
  authorizeRoles("customer"),
  getFarmersByMarket
);

// ADMIN - UPDATE MARKET
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateMarket
);

// ADMIN - DELETE MARKET
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteMarket
);

// VIEW SINGLE MARKET
router.get(
  "/:id",
  getMarketById
);

module.exports = router;