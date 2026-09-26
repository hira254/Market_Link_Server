var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");
require("dotenv").config();
const dbConnection = require("./config/db");

app.use(cors());
app.use(bodyParser.json());

dbConnection();
var UserModel = require("./models/User");
const authRoutes = require("./routes/authRoute");
app.use("/api/auth", authRoutes);

const customerRoute = require("./routes/customerRoute");
const protect = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");
const farmerRoutes = require("./routes/farmerRoutes");
const marketRoutes = require("./routes/marketRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoute");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const familyRoutes = require("./routes/familyRoutes");
const assistantRoutes = require("./routes/assistantRoutes");

app.use("/api/customer/family", familyRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.get("/", (req, res) => {
  res.send("MarketLink API is running...");
});
app.use("/api/customer", customerRoute);
app.get(
  "/api/customer-test",
  protect,
  authorizeRoles("customer"),
  (req, res) => {
    res.json({
      message: "Customer route accessed successfully",
      user: req.user,
    });
  }
);
app.get("/health", (req, res) => {
  console.log("Hello MarketLink - Server APIs are working perfectly");

  res.status(200).json({
    success: true,
    message: "MarketLink Server APIs are working perfectly",
  });
});
app.use("/api/farmers", farmerRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use("/api/admin", adminRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
})
