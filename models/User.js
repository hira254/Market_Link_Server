var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
     name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
    
      trim: true,
    },

    address: {
      type: String,
  
      trim: true,
    },
stallName: {
  type: String,
  default: ""
},
    role: {
      type: String,
      enum: ["customer", "farmer", "admin"],
      default: "customer",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  familyMembers: [
      {
        name: { type: String, required: true },
        relation: { type: String, default: "Family" }, // Spouse, Child, Parent, Sibling, etc.
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
}, {
    timestamps: true,
})

module.exports = mongoose.model('User', userSchema);