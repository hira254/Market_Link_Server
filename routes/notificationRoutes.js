const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");



router.get(
  "/my",
  protect,
  getMyNotifications
);



router.put(
  "/read-all",
  protect,
  markAllAsRead
);


router.put(
  "/:id/read",
  protect,
  markAsRead
);


router.delete(
  "/:id",
  protect,
  deleteNotification
);


module.exports = router;