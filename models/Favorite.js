const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


favoriteSchema.index(
  {
    customer: 1,
    product: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Favorite", favoriteSchema);