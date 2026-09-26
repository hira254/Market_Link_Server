const FarmerProfile = require("../models/FarmerProfile");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Market = require("../models/Market");

const getAllFarmers = async (req, res) => {
  try {
    const farmers = await FarmerProfile.find()
      .populate("userId", "name email role")
      .populate("markets", "name city address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get farmers",
      error: error.message,
    });
  }
};
// ADMIN - REPORTS & ANALYTICS
// ADMIN - REPORTS & ANALYTICS
const getReportsAnalytics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const completedOrders = await Order.countDocuments({
      status: "completed",
    });

    const pendingOrders = await Order.countDocuments({
      status: "pending",
    });

    // Revenue from completed orders
    const completedOrdersData = await Order.find({
      status: "completed",
    }).select("totalAmount");

    const totalRevenue = completedOrdersData.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Most active farmers based on number of products
    const activeFarmers = await Product.aggregate([
      {
        $group: {
          _id: "$farmer",
          productCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          productCount: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    await User.populate(activeFarmers, {
      path: "_id",
      select: "name email",
    });

    res.status(200).json({
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
      },

      revenue: {
        total: totalRevenue,
      },

      activeFarmers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate reports and analytics",
      error: error.message,
    });
  }
};



const updateFarmerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "suspended", "pending"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const farmer = await FarmerProfile.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer profile not found",
      });
    }

    farmer.approvalStatus = status;

    await farmer.save();

    res.status(200).json({
      message: `Farmer status changed to ${status}`,
      farmer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update farmer status",
      error: error.message,
    });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const User = require("../models/User");

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get users",
      error: error.message,
    });
  }
};



const updateUserStatus = async (req, res) => {
  try {
    const User = require("../models/User");

    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

 
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot change your own status",
      });
    }

    user.status = status;

    await user.save();

    res.status(200).json({
      message: `User status changed to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user status",
      error: error.message,
    });
  }
};
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalFarmers,
      totalAdmins,
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      pendingFarmers,
      approvedFarmers,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({ role: "customer" }),

      User.countDocuments({ role: "farmer" }),

      User.countDocuments({ role: "admin" }),

      Product.countDocuments(),

      Order.countDocuments(),

      Order.countDocuments({ status: "pending" }),

      Order.countDocuments({ status: "completed" }),

      FarmerProfile.countDocuments({
        approvalStatus: "pending",
      }),

      FarmerProfile.countDocuments({
        approvalStatus: "approved",
      }),
    ]);

    res.status(200).json({
      users: {
        total: totalUsers,
        customers: totalCustomers,
        farmers: totalFarmers,
        admins: totalAdmins,
      },

      products: {
        total: totalProducts,
      },

      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
      },

      farmers: {
        pendingApproval: pendingFarmers,
        approved: approvedFarmers,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get dashboard statistics",
      error: error.message,
    });
  }
};
module.exports = {
  getAllFarmers,
  updateFarmerStatus,
    getAllUsers,
    updateUserStatus,
     getDashboardStats,
  getReportsAnalytics,
};