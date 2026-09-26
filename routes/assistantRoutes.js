const express = require("express");

const {
  chatWithAssistant,
} = require("../controllers/assistantController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/chat",  chatWithAssistant);

module.exports = router;