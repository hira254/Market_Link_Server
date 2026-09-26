 
const Review = require("../models/Review"); 
const Product = require("../models/Product"); 
const Order = require("../models/Order"); 
 
const createReview = async (req, res) => { 
  try { 
    const { product, order, rating, comment } = req.body; 
 
    if (!product || !order || !rating) { 
      return res.status(400).json({ 
        message: "Product, order and rating are required", 
      }); 
    } 
 
    if (rating < 1 || rating > 5) { 
      return res.status(400).json({ 
        message: "Rating must be between 1 and 5", 
      }); 
    } 
 
   
    const existingOrder = await Order.findOne({ 
      _id: order, 
      customer: req.user.id, 
    }); 
 
    if (!existingOrder) { 
      return res.status(404).json({ 
        message: "Order not found", 
      }); 
    } 
 
     
    if (existingOrder.status !== "completed") { 
      return res.status(400).json({ 
        message: "You can review a product only after order is completed", 
      }); 
    } 
 
     
    const orderedProduct = existingOrder.items.some( 
      (item) => item.product.toString() === product 
    ); 
 
    if (!orderedProduct) { 
      return res.status(400).json({ 
        message: "This product was not part of your order", 
      }); 
    } 
 
     
    const existingReview = await Review.findOne({ 
      customer: req.user.id, 
      product, 
      order, 
    }); 
 
    if (existingReview) { 
      return res.status(400).json({ 
        message: "You have already reviewed this product", 
      }); 
    } 
 
    const review = await Review.create({ 
      customer: req.user.id, 
      product, 
      order, 
      rating, 
      comment, 
    }); 
 
    const populatedReview = await Review.findById(review._id) 
      .populate("customer", "name") 
      .populate("product", "name category") 
      .populate("order", "_id status"); 
 
    res.status(201).json({ 
      message: "Review created successfully", 
      review: populatedReview, 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      message: "Failed to create review", 
      error: error.message, 
    }); 
  } 
}; 
 
 
const getProductReviews = async (req, res) => { 
  try { 
    const reviews = await Review.find({ 
      product: req.params.productId, 
    }) 
      .populate("customer", "name") 
      .sort({ createdAt: -1 }); 
 
    res.status(200).json({ 
      count: reviews.length, 
      reviews, 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      message: "Failed to fetch reviews", 
      error: error.message, 
    }); 
  } 
}; 
 
 
const getMyReviews = async (req, res) => { 
  try { 
    const reviews = await Review.find({ 
      customer: req.user.id, 
    }) 
      .populate("product", "name category") 
      .sort({ createdAt: -1 }); 
 
    res.status(200).json({ 
      count: reviews.length, 
      reviews, 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      message: "Failed to fetch your reviews", 
      error: error.message, 
    }); 
  } 
}; 
 
 
const deleteReview = async (req, res) => { 
  try { 
    const review = await Review.findById(req.params.id); 
 
    if (!review) { 
      return res.status(404).json({ 
        message: "Review not found", 
      }); 
    } 
 
    if (review.customer.toString() !== req.user.id) { 
      return res.status(403).json({ 
        message: "You can only delete your own review", 
      }); 
    } 
 
    await review.deleteOne(); 
 
    res.status(200).json({ 
      message: "Review deleted successfully", 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      message: "Failed to delete review", 
      error: error.message, 
    }); 
  } 
}; 
const getMyFarmerReviews = async (req, res) => { 
  try { 
    const products = await Product.find({ 
      farmer: req.user.id, 
    }).select("_id"); 
 
    const productIds = products.map( 
      (product) => product._id 
    ); 
 
    const reviews = await Review.find({ 
      product: { $in: productIds }, 
    }) 
      .populate("customer", "name") 
      .populate("product", "name category") 
      .sort({ createdAt: -1 }); 
 
    res.status(200).json({ 
      count: reviews.length, 
      reviews, 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      message: "Failed to fetch farmer reviews", 
      error: error.message, 
    }); 
  } 
}; 
// ADMIN - GET ALL REVIEWS 
const getAllReviewsForAdmin = async (req, res) => { 
  try { 
    const reviews = await Review.find() 
      .populate("customer", "name email") 
      .populate("product", "name category farmer") 
      .sort({ createdAt: -1 }); 
 
    res.status(200).json({ 
      count: reviews.length, 
      reviews, 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      message: "Failed to fetch all reviews", 
      error: error.message, 
    }); 
  } 
}; 
 
 
// ADMIN - DELETE REVIEW 
const adminDeleteReview = async (req, res) => { 
  try { 
    const review = await Review.findById(req.params.id); 
 
    if (!review) { 
      return res.status(404).json({ 
        message: "Review not found", 
      }); 
    } 
 
    await review.deleteOne(); 
 
    res.status(200).json({ 
      message: "Review removed by admin successfully", 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      message: "Failed to remove review", 
      error: error.message, 
    }); 
  } 
}; 
const respondToReview = async (req, res) => { 
  try { 
    const { response } = req.body; 
 
    if (!response || !response.trim()) { 
      return res.status(400).json({ 
        message: "Response is required", 
      }); 
    } 
 
    const review = await Review.findById(req.params.id); 
 
    if (!review) { 
      return res.status(404).json({ 
        message: "Review not found", 
      }); 
    } 
 
    // Check that this review belongs to a product 
    // owned by the logged-in farmer 
    const product = await Product.findOne({ 
      _id: review.product, 
      farmer: req.user.id, 
    }); 
 
    if (!product) { 
      return res.status(403).json({ 
        message: "You can only respond to reviews on your products", 
      }); 
    } 
 
    review.response = response.trim(); 
 
    await review.save(); 
 
    const updatedReview = await Review.findById(review._id) 
      .populate("customer", "name") 
      .populate("product", "name category"); 
 
    res.status(200).json({ 
      message: "Response added successfully", 
      review: updatedReview, 
    }); 
  } catch (error) { 
    res.status(500).json({ 
      message: "Failed to add response", 
      error: error.message, 
    }); 
  } 
}; 
module.exports = { 
  createReview, 
  respondToReview, 
  getProductReviews, 
  getMyReviews, 
  deleteReview, 
   getAllReviewsForAdmin, 
  adminDeleteReview, 
   getMyFarmerReviews, 
};