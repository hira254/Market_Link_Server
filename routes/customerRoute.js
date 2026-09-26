const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/customerController");


// Get logged-in customer profile
router.get(
  "/profile",
  protect,
  getMyProfile
);


// Update logged-in customer profile
router.put(
  "/profile",
  protect,
  updateMyProfile
);


module.exports = router;