const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ==========================================
// GET MY CART
// ==========================================
const getMyCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      customer: req.user.id,
    }).populate({
      path: "items.product",
      select: "name category price image stock isAvailable farmer",
      populate: {
        path: "farmer",
        select: "name email",
      },
    });

    // Create empty cart if it doesn't exist
    if (!cart) {
      cart = await Cart.create({
        customer: req.user.id,
        items: [],
      });
    }

    const itemCount = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const totalAmount = cart.items.reduce((total, item) => {
      if (!item.product) return total;

      return (
        total +
        Number(item.product.price || 0) * item.quantity
      );
    }, 0);

    res.status(200).json({
      cart,
      itemCount,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get cart",
      error: error.message,
    });
  }
};

// ==========================================
// ADD PRODUCT TO CART
// ==========================================
const addToCart = async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    const requestedQuantity = Number(quantity) || 1;

    if (requestedQuantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    // Check product
    const existingProduct = await Product.findById(product);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Check availability
    if (!existingProduct.isAvailable) {
      return res.status(400).json({
        message: "Product is not available",
      });
    }

    // Check stock
    if (existingProduct.stock < requestedQuantity) {
      return res.status(400).json({
        message: "Not enough stock available",
      });
    }

    // Find cart
    let cart = await Cart.findOne({
      customer: req.user.id,
    });

    // Create cart
    if (!cart) {
      cart = await Cart.create({
        customer: req.user.id,
        items: [
          {
            product,
            quantity: requestedQuantity,
          },
        ],
      });
    } else {
      // Check existing item
      const existingItem = cart.items.find(
        (item) => item.product.toString() === product
      );

      if (existingItem) {
        const newQuantity =
          existingItem.quantity + requestedQuantity;

        if (newQuantity > existingProduct.stock) {
          return res.status(400).json({
            message: "Requested quantity exceeds available stock",
          });
        }

        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({
          product,
          quantity: requestedQuantity,
        });
      }

      await cart.save();
    }

    // Populate cart
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name category price image stock isAvailable farmer",
      populate: {
        path: "farmer",
        select: "name email",
      },
    });

    const itemCount = populatedCart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const totalAmount = populatedCart.items.reduce(
      (total, item) => {
        if (!item.product) return total;

        return (
          total +
          Number(item.product.price || 0) * item.quantity
        );
      },
      0
    );

    res.status(200).json({
      message: "Product added to cart",
      cart: populatedCart,
      itemCount,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add product to cart",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE CART ITEM QUANTITY
// ==========================================
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const newQuantity = Number(quantity);

    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({
      customer: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const cartItem = cart.items.id(id);

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    // Get product to check stock
    const product = await Product.findById(cartItem.product);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        message: "Product is not available",
      });
    }

    if (newQuantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} items are available in stock`,
      });
    }

    cartItem.quantity = newQuantity;

    await cart.save();

    // Populate updated cart
    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name category price image stock isAvailable farmer",
      populate: {
        path: "farmer",
        select: "name email",
      },
    });

    const itemCount = populatedCart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const totalAmount = populatedCart.items.reduce(
      (total, item) => {
        if (!item.product) return total;

        return (
          total +
          Number(item.product.price || 0) * item.quantity
        );
      },
      0
    );

    res.status(200).json({
      message: "Cart item updated",
      cart: populatedCart,
      itemCount,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update cart item",
      error: error.message,
    });
  }
};

// ==========================================
// REMOVE CART ITEM
// ==========================================
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({
      customer: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const cartItem = cart.items.id(id);

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    cartItem.deleteOne();

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name category price image stock isAvailable farmer",
      populate: {
        path: "farmer",
        select: "name email",
      },
    });

    const itemCount = populatedCart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const totalAmount = populatedCart.items.reduce(
      (total, item) => {
        if (!item.product) return total;

        return (
          total +
          Number(item.product.price || 0) * item.quantity
        );
      },
      0
    );

    res.status(200).json({
      message: "Product removed from cart",
      cart: populatedCart,
      itemCount,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove cart item",
      error: error.message,
    });
  }
};

// ==========================================
// CLEAR CART
// ==========================================
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      customer: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cart,
      itemCount: 0,
      totalAmount: 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};