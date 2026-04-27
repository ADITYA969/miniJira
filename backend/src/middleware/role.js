const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

const requireActive = (req, res, next) => {
  if (!req.user || req.user.status !== "active") {
    return res.status(403).json({ success: false, message: "Account is not active. Please wait for admin approval." });
  }
  next();
};

module.exports = { requireRole, requireActive };
