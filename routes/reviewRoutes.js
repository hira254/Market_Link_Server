const express = require("express");

const {
  createReview,
  getProductReviews,
  getMyReviews,
  deleteReview,
  getMyFarmerReviews,
  getAllReviewsForAdmin,
  adminDeleteReview,
  respondToReview,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// ================= CUSTOMER =================

// Create review
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createReview
);

// Customer's own reviews
router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyReviews
);

// Product reviews
router.get(
  "/product/:productId",
  protect,
  getProductReviews
);

// Delete own review
router.delete(
  "/:id",
  protect,
  authorizeRoles("customer"),
  deleteReview
);


// ================= FARMER =================

// Get reviews for farmer's products
router.get(
  "/reviews",
  protect,
  authorizeRoles("farmer"),
  getMyFarmerReviews
);

// Farmer responds to review
router.put(
  "/:id/respond",
  protect,
  authorizeRoles("farmer"),
  respondToReview
);


// ================= ADMIN =================

// Get all reviews
router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  getAllReviewsForAdmin
);

// Delete any review
router.delete(
  "/admin/:id",
  protect,
  authorizeRoles("admin"),
  adminDeleteReview
);


module.exports = router;