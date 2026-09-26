const mongoose = require("mongoose");

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    stallName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },

    markets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Market",
      },
    ],

    operatingDays: [
      {
        type: String,
        trim: true,
      },
    ],

    pickupWindows: [
      {
        type: String,
        trim: true,
      },
    ],

    address: {
      type: String,
      required: true,
      trim: true,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FarmerProfile", farmerProfileSchema);