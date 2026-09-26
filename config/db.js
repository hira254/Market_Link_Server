// const mongoose = require('mongoose');

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("Database connected successfully");
//   })
//   .catch((err) => {
//     console.error("Database connection error:", err);
//   });


const mongoose = require("mongoose");
require('dotenv').config();

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error while connecting with MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = dbConnection;