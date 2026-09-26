const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getFarmerOrders,
  updateOrderStatus,
  getFarmerOrderHistory
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createOrder
);

router.get(
  "/farmer/history",
  protect,
  authorizeRoles("farmer"),
  getFarmerOrderHistory
);
router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyOrders
);

router.get(
  "/:id",
  protect,
  authorizeRoles("customer"),
  getOrderById
);


router.get(
  "/farmer/orders",
  protect,
  authorizeRoles("farmer"),
  getFarmerOrders
);


router.put(
  "/:id/status",
  protect,
  authorizeRoles("farmer"),
  updateOrderStatus
);

module.exports = router;