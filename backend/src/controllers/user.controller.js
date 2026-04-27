const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return sendError(res, "User not found", 404);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (Object.keys(updates).length === 0) {
      return sendError(res, "No valid fields provided. Allowed fields: name");
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select("-password");
    sendSuccess(res, user, "Profile updated successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile };
