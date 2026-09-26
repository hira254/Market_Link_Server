const Market = require("../models/Market");

// CREATE MARKET
const createMarket = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      operatingDays,
      openingTime,
      closingTime,
      latitude,
      longitude,
    } = req.body;

    if (!name || !address || !city || !openingTime || !closingTime) {
      return res.status(400).json({
        message:
          "Name, address, city, opening time and closing time are required",
      });
    }

    const market = await Market.create({
      name,
      address,
      city,
      operatingDays,
      openingTime,
      closingTime,
      latitude,
      longitude,
    });

    res.status(201).json({
      message: "Market created successfully",
      market,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create market",
      error: error.message,
    });
  }
};

// GET ALL MARKETS
const getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find({
      status: "active",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: markets.length,
      markets,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch markets",
      error: error.message,
    });
  }
};

// GET SINGLE MARKET
const getMarketById = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({
        message: "Market not found",
      });
    }

    res.status(200).json({
      market,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch market",
      error: error.message,
    });
  }
};
// GET FARMERS BY MARKET
const getFarmersByMarket = async (req, res) => {
  try {
    const FarmerProfile = require("../models/FarmerProfile");

    const farmers = await FarmerProfile.find({
      markets: req.params.id,
      approvalStatus: "approved",
    }).populate("userId", "name email phone");

    res.status(200).json({
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farmers for this market",
      error: error.message,
    });
  }
};
// UPDATE MARKET
const updateMarket = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      operatingDays,
      openingTime,
      closingTime,
      latitude,
      longitude,
      status,
    } = req.body;

    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({
        message: "Market not found",
      });
    }

    market.name = name ?? market.name;
    market.address = address ?? market.address;
    market.city = city ?? market.city;
    market.operatingDays = operatingDays ?? market.operatingDays;
    market.openingTime = openingTime ?? market.openingTime;
    market.closingTime = closingTime ?? market.closingTime;
    market.latitude = latitude ?? market.latitude;
    market.longitude = longitude ?? market.longitude;
    market.status = status ?? market.status;

    await market.save();

    res.status(200).json({
      message: "Market updated successfully",
      market,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update market",
      error: error.message,
    });
  }
};


// DELETE MARKET
const deleteMarket = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({
        message: "Market not found",
      });
    }

    await Market.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Market deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete market",
      error: error.message,
    });
  }
};
module.exports = {
  createMarket,
  getAllMarkets,
  getMarketById,
    getFarmersByMarket,
      updateMarket,
  deleteMarket,

};