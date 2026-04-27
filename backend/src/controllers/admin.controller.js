const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};

const getPendingUsers = async (req, res, next) => {
  try {
    const users = await User.find({ status: "pending" }).select("-password").sort({ createdAt: -1 });
    sendSuccess(res, users);
  } catch (err) {
    next(err);
  }
};

const approveUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: "active" }, { new: true }).select("-password");
    if (!user) return sendError(res, "User not found", 404);
    sendSuccess(res, user, "User approved successfully");
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return sendError(res, "You cannot delete your own account");
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, "User not found", 404);
    sendSuccess(res, null, "User deleted successfully");
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["admin", "member"].includes(role)) {
      return sendError(res, "Role must be admin or member");
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return sendError(res, "User not found", 404);
    sendSuccess(res, user, "User role updated");
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getPendingUsers, approveUser, deleteUser, updateUserRole };
