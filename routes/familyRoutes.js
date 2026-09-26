const express = require("express");
const router = express.Router();

// Controllers import
const familyController = require("../controllers/familyController");

// Middleware import (Agar aapke authMiddleware mein protect function hai)
const authMiddleware = require("../middleware/authMiddleware");

// Middleware verification (fallback to prevent crash)
const protect = authMiddleware.protect || authMiddleware;

// Safe Route Definitions
router.get("/", protect, familyController.getFamilyMembers);
router.post("/", protect, familyController.addFamilyMember);
router.delete("/:memberId", protect, familyController.deleteFamilyMember);

module.exports = router;