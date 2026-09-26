const User = require("../models/User");

// ================= GET ALL FAMILY MEMBERS =================
exports.getFamilyMembers = async (req, res) => {
  try {
    // Check both _id and id from Auth Middleware
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing in request" });
    }

    const user = await User.findById(userId).select("familyMembers");

    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    res.status(200).json({
      success: true,
      familyMembers: user.familyMembers || [],
    });
  } catch (error) {
    console.error("GET FAMILY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch family members", error: error.message });
  }
};

// ================= ADD FAMILY MEMBER =================
exports.addFamilyMember = async (req, res) => {
  try {
    // 1. Resolve User ID safely
    const userId = req.user?._id || req.user?.id;

    console.log("--> Attempting to add family member for User ID:", userId);
    console.log("--> Incoming Data:", req.body);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized token/session" });
    }

    const { name, relation, email, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Family member name is required" });
    }

    // 2. Fetch User
    const user = await User.findById(userId);

    if (!user) {
      console.log("❌ USER NOT FOUND IN DATABASE");
      return res.status(404).json({ message: "User not found in database" });
    }

    // 3. Limit check (Max 5)
    if (user.familyMembers && user.familyMembers.length >= 5) {
      return res.status(400).json({ message: "Maximum 5 family members limit reached" });
    }

    // 4. Create New Family Member Object
    const newMember = {
      name: name.trim(),
      relation: relation || "Family",
      email: email ? email.trim() : "",
      phone: phone ? phone.trim() : "",
    };

    // 5. Push and Save explicitly
    if (!user.familyMembers) {
      user.familyMembers = [];
    }

    user.familyMembers.push(newMember);
    
    // Save to Database
    const updatedUser = await user.save();

    console.log("✅ SUCCESSFULLY SAVED TO MONGODB:", updatedUser.familyMembers);

    res.status(201).json({
      success: true,
      message: "Family member added successfully",
      familyMembers: updatedUser.familyMembers,
    });
  } catch (error) {
    console.error("❌ ADD FAMILY DB ERROR:", error);
    res.status(500).json({ message: "Database save failed", error: error.message });
  }
};

// ================= DELETE FAMILY MEMBER =================
exports.deleteFamilyMember = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { memberId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.familyMembers = user.familyMembers.filter(
      (member) => member._id.toString() !== memberId
    );

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Family member removed successfully",
      familyMembers: updatedUser.familyMembers,
    });
  } catch (error) {
    console.error("DELETE FAMILY ERROR:", error);
    res.status(500).json({ message: "Failed to remove family member", error: error.message });
  }
};