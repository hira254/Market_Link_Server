const express = require("express");
 const { createReview, getProductReviews, getMyReviews, deleteReview, getMyFarmerReviews, getAllReviewsForAdmin, adminDeleteReview, 
  respondToReview, } = require("../controllers/reviewController"); 
  const protect = require("../middleware/authMiddleware"); 
  const authorizeRoles = require("../middleware/roleMiddleware"); 
  const router = express.Router(); 
  // ================= CUSTOMER ================= // Create review // Login + customer required 
  router.post( "/", protect, authorizeRoles("customer"), createReview ); 
  // Customer's own reviews // Login + customer required 
  router.get( "/my", protect, authorizeRoles("customer"), getMyReviews ); 
  // Product reviews // PUBLIC - no login required 
  router.get( "/product/:productId", getProductReviews ); 
  // Delete own review // Login + customer required
   router.delete( "/:id", protect, authorizeRoles("customer"), deleteReview ); // ================= FARMER ================= // 
   // Get reviews for farmer's products // Login + farmer required 
   router.get( "/reviews", protect, authorizeRoles("farmer"), getMyFarmerReviews ); 
   // Farmer responds to review // Login + farmer required 
   router.put( "/:id/respond", protect, authorizeRoles("farmer"), respondToReview ); 
   // ================= ADMIN ================= // Get all reviews // Login + admin required 
   router.get( "/admin", protect, authorizeRoles("admin"), getAllReviewsForAdmin ); 
   // Delete any review // Login + admin required 
   router.delete( "/admin/:id", protect, authorizeRoles("admin"), adminDeleteReview ); module.exports = router