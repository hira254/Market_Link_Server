const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
   getAllFarmers,
  updateFarmerStatus,
  getAllUsers,
  updateUserStatus,
  getDashboardStats,
  getReportsAnalytics,
} = require("../controllers/adminController");



router.get(
  "/farmers",
  protect,
  authorizeRoles("admin"),
  getAllFarmers
);



router.put(
  "/farmers/:id/status",
  protect,
  authorizeRoles("admin"),
  updateFarmerStatus
);

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);



router.put(
  "/users/:id/status",
  protect,
  authorizeRoles("admin"),
  updateUserStatus
);
router.get(
  "/reports",
  protect,
  authorizeRoles("admin"),
  getReportsAnalytics
);
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);
module.exports = router;