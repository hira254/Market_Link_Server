const Product = require("../models/Product");
const Market = require("../models/Market");
const FarmerProfile = require("../models/FarmerProfile");

const {
  generateAssistantResponse,
} = require("../services/assistantService");

const chatWithAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    // Get products
    const products = await Product.find()
      .populate("farmer")
      .lean();

    // Get markets
    const markets = await Market.find().lean();

    // Get farmers
    const farmers = await FarmerProfile.find().lean();

    const answer = await generateAssistantResponse({
      question: question.trim(),
      products,
      farmers,
      markets,
    });

    return res.status(200).json({
      success: true,
      question,
      answer,
    });
  } catch (error) {
    console.error("AI ASSISTANT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "AI Assistant failed",
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAssistant,
};