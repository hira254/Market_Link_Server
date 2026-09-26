const Order = require("../models/Order");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
// CREATE ORDER - Customer only
const createOrder = async (req, res) => {
  try {
    const {
      items,
      pickupDate,
      pickupWindow,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one product is required",
      });
    }

    if (!pickupDate || !pickupWindow) {
      return res.status(400).json({
        message: "Pickup date and pickup window are required",
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          message: "Each item must have product and valid quantity",
        });
      }

      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.product}`,
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          message: `${product.name} is not available`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }

      const subtotal = product.price * item.quantity;

      orderItems.push({
        product: product._id,
        farmer: product.farmer,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });

      totalAmount += subtotal;
    }

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      totalAmount,
      pickupDate,
      pickupWindow,
      notes,
    });
// Get unique farmers from order items
const farmerIds = [
  ...new Set(orderItems.map((item) => item.farmer.toString())),
];

// Notify farmers about new order
await Notification.insertMany(
  farmerIds.map((farmerId) => ({
    user: farmerId,
    title: "New Order Received",
    message: `You have received a new order of Rs. ${totalAmount}`,
    type: "order",
  }))
);
    // Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("customer", "name email")
      .populate("items.product", "name category price")
      .populate("items.farmer", "name email");

    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// GET MY ORDERS - Customer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user.id,
    })
      .populate("items.product", "name category price image")
      .populate("items.farmer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// GET SINGLE ORDER - Customer
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("items.product", "name category price image")
      .populate("items.farmer", "name email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Customer can only view own order
    if (order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only view your own orders",
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// GET FARMER ORDERS
const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.farmer": req.user.id,
    })
      .populate("customer", "name email")
      .populate("items.product", "name category price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farmer orders",
      error: error.message,
    });
  }
};

// UPDATE ORDER STATUS - Farmer
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "confirmed",
      "ready",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Check if this farmer has a product in this order
    const isFarmerInOrder = order.items.some(
      (item) => item.farmer.toString() === req.user.id
    );

    if (!isFarmerInOrder) {
      return res.status(403).json({
        message: "You do not have permission to update this order",
      });
    }

    order.status = status;

    await order.save();
    const statusMessages = {
  confirmed: "Your order has been confirmed by the farmer.",
  ready: "Your order is ready for pickup.",
  completed: "Your order has been completed.",
  cancelled: "Your order has been cancelled.",
};

await Notification.create({
  user: order.customer,
  title: "Order Status Updated",
  message: statusMessages[status],
  type: "order",
});

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
const getFarmerOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.farmer": req.user.id,
      status: { $in: ["completed", "cancelled"] },
    })
      .populate("customer", "name email")
      .populate("items.product", "name category price")
      .sort({ createdAt: -1 });

    const completedOrders = orders.filter(
      (order) => order.status === "completed"
    );

    const cancelledOrders = orders.filter(
      (order) => order.status === "cancelled"
    );

    const totalRevenue = completedOrders.reduce(
      (total, order) => total + Number(order.totalAmount || 0),
      0
    );

    res.status(200).json({
      count: orders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      totalRevenue,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farmer order history",
      error: error.message,
    });
  }
};
module.exports = {
  createOrder,
  getFarmerOrderHistory,
  getMyOrders,
  getOrderById,
  getFarmerOrders,
  updateOrderStatus,
};