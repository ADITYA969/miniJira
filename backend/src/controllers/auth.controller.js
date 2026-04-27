const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return sendError(res, "Email is already registered", 409);

    const assignedRole = role === "admin" ? "admin" : "member";
    const user = await User.create({ name, email, password, role: assignedRole });

    sendSuccess(
      res,
      { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status },
      "Signup successful. Your account is pending admin approval.",
      201
    );
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return sendError(res, "Invalid email or password", 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, "Invalid email or password", 401);

    if (user.status !== "active") {
      return sendError(res, "Your account is pending approval. Contact the admin.", 403);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, status: user.status },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    sendSuccess(res, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, "Login successful");
  } catch (err) {
    next(err);
  }
};

const bootstrapAdmin = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, "Email is required");
    }

    const activeAdminExists = await User.findOne({ role: "admin", status: "active" });
    if (activeAdminExists) {
      return sendError(
        res,
        "Bootstrap not allowed. An active admin already exists. Use the Admin panel to manage users.",
        403
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, "No account found with this email. Please signup first.", 404);
    }

    if (user.role !== "admin") {
      return sendError(res, "This account is not an admin. Update the role to admin first or signup again with role admin.", 400);
    }

    if (user.status === "active") {
      return sendError(res, "This admin account is already active. You can log in directly.", 400);
    }

    user.status = "active";
    await user.save();

    sendSuccess(
      res,
      { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status },
      "Admin account activated successfully. You can now log in."
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, bootstrapAdmin };
