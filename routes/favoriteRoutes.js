const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} = require("../controllers/favoriteController");


router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  addFavorite
);

router.get(
  "/my",
  protect,
  authorizeRoles("customer"),
  getMyFavorites
);



router.delete(
  "/:id",
  protect,
  authorizeRoles("customer"),
  removeFavorite
);


module.exports = router;