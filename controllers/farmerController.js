const FarmerProfile = require("../models/FarmerProfile");
const Product = require("../models/Product");
const Review = require("../models/Review");

// CREATE FARMER PROFILE
const createFarmerProfile = async (req, res) => {
  try {
    const {
      stallName,
      contactPerson,
      markets,
      operatingDays,
      pickupWindows,
      address,
      latitude,
      longitude,
    } = req.body;

    if (!stallName || !contactPerson || !address) {
      return res.status(400).json({
        message: "Stall name, contact person and address are required",
      });
    }

    const existingProfile = await FarmerProfile.findOne({
      userId: req.user.id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Farmer profile already exists",
      });
    }

    const profile = await FarmerProfile.create({
      userId: req.user.id,
      stallName,
      contactPerson,
      markets,
      operatingDays,
      pickupWindows,
      address,
      latitude,
      longitude,
    });

    res.status(201).json({
      message: "Farmer profile created successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create farmer profile",
      error: error.message,
    });
  }
};

// GET ALL FARMERS
const getAllFarmers = async (req, res) => {
  try {
    const farmers = await FarmerProfile.find()
      .populate("userId", "name email phone")
      .populate("markets");

    res.status(200).json({
      farmers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farmers",
      error: error.message,
    });
  }
};

// GET MY FARMER PROFILE
const getMyFarmerProfile = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({
      userId: req.user.id,
    }).populate("markets");

    if (!profile) {
      return res.status(404).json({
        message: "Farmer profile not found",
      });
    }

    res.status(200).json({
      profile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farmer profile",
      error: error.message,
    });
  }
};

// ADD MARKET TO FARMER
const addMarketToFarmer = async (req, res) => {
  try {
    const { marketId } = req.body;

    if (!marketId) {
      return res.status(400).json({
        message: "Market ID is required",
      });
    }

    const profile = await FarmerProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Farmer profile not found",
      });
    }

    if (profile.markets.includes(marketId)) {
      return res.status(400).json({
        message: "Market already added",
      });
    }

    profile.markets.push(marketId);

    await profile.save();

    const updatedProfile = await FarmerProfile.findById(profile._id)
      .populate("markets");

    res.status(200).json({
      message: "Market added to farmer profile",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add market",
      error: error.message,
    });
  }
};

// GET FARMER REVIEWS
const getFarmerReviews = async (req, res) => {
  try {
    // FarmerProfile ID frontend se aa raha hai
    const profile = await FarmerProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    // FarmerProfile ka userId actual Product.farmer hai
    const products = await Product.find({
      farmer: profile.userId,
    }).select("_id");

    const productIds = products.map((product) => product._id);

    // Farmer ke products ke reviews
    const reviews = await Review.find({
      product: { $in: productIds },
    })
      .populate("customer", "name")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    // Average rating
    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          ).toFixed(1)
        : 0;

    res.status(200).json({
      farmer: profile._id,
      stallName: profile.stallName,
      averageRating: Number(averageRating),
      totalReviews,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farmer reviews",
      error: error.message,
    });
  }
};
// GET FARMER CURRENT WEEKLY STOCK
const getFarmerStock = async (req, res) => {
  try {
    // FarmerProfile find karo
    const profile = await FarmerProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    // Farmer ke available products
    const products = await Product.find({
      farmer: profile.userId,
      isAvailable: true,
      stock: { $gt: 0 },
    }).select(
      "name category description price unit stock image isAvailable"
    );

    res.status(200).json({
      farmer: profile._id,
      stallName: profile.stallName,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farmer stock",
      error: error.message,
    });
  }
};
// UPDATE MY FARMER PROFILE
const updateFarmerProfile = async (req, res) => {
  try {
    const {
      stallName,
      contactPerson,
      markets,
      operatingDays,
      pickupWindows,
      address,
      latitude,
      longitude,
    } = req.body;

    const profile = await FarmerProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Farmer profile not found",
      });
    }

    profile.stallName =
      stallName ?? profile.stallName;

    profile.contactPerson =
      contactPerson ?? profile.contactPerson;

    profile.markets =
      markets ?? profile.markets;

    profile.operatingDays =
      operatingDays ?? profile.operatingDays;

    profile.pickupWindows =
      pickupWindows ?? profile.pickupWindows;

    profile.address =
      address ?? profile.address;

    profile.latitude =
      latitude ?? profile.latitude;

    profile.longitude =
      longitude ?? profile.longitude;

    await profile.save();

    const updatedProfile =
      await FarmerProfile.findById(profile._id)
        .populate("markets");

    res.status(200).json({
      message: "Farmer profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update farmer profile",
      error: error.message,
    });
  }
};
module.exports = {
   createFarmerProfile,
  getMyFarmerProfile,
  addMarketToFarmer,
  getAllFarmers,
  updateFarmerProfile,
  getFarmerStock,
  getFarmerReviews,
};