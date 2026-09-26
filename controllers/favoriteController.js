const Favorite = require("../models/Favorite");
const Product = require("../models/Product");

// Add product to favorites
const addFavorite = async (req, res) => {
  try {
    const { product } = req.body;

    if (!product) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    // Check product exists
    const existingProduct = await Product.findById(product);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Check already favorite
    const existingFavorite = await Favorite.findOne({
      customer: req.user.id,
      product,
    });

    if (existingFavorite) {
      return res.status(400).json({
        message: "Product already added to favorites",
      });
    }

    const favorite = await Favorite.create({
      customer: req.user.id,
      product,
    });

    const populatedFavorite = await favorite.populate({
      path: "product",
      populate: {
        path: "farmer",
        select: "name email",
      },
    });

    res.status(201).json({
      message: "Product added to favorites",
      favorite: populatedFavorite,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add favorite",
      error: error.message,
    });
  }
};


// Get my favorites
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      customer: req.user.id,
    })
      .populate({
        path: "product",
        populate: {
          path: "farmer",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get favorites",
      error: error.message,
    });
  }
};


// Remove favorite
const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const favorite = await Favorite.findById(id);

    if (!favorite) {
      return res.status(404).json({
        message: "Favorite not found",
      });
    }

    // Make sure customer owns this favorite
    if (favorite.customer.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You cannot remove this favorite",
      });
    }

    await Favorite.findByIdAndDelete(id);

    res.status(200).json({
      message: "Product removed from favorites",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove favorite",
      error: error.message,
    });
  }
};


module.exports = {
  addFavorite,
  getMyFavorites,
  removeFavorite,
};