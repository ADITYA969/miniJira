const { isValidEmail, isValidPassword, isNonEmptyString } = require("../utils/validation");

const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!isNonEmptyString(name)) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "A valid email is required" });
  }
  if (!password || !isValidPassword(password)) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "A valid email is required" });
  }
  if (!password || !isNonEmptyString(password)) {
    return res.status(400).json({ success: false, message: "Password is required" });
  }
  next();
};

const validateCreateProject = (req, res, next) => {
  const { name } = req.body;
  if (!isNonEmptyString(name)) {
    return res.status(400).json({ success: false, message: "Project name is required" });
  }
  next();
};

const validateCreateTask = (req, res, next) => {
  const { title, project } = req.body;
  if (!isNonEmptyString(title)) {
    return res.status(400).json({ success: false, message: "Task title is required" });
  }
  if (!isNonEmptyString(project)) {
    return res.status(400).json({ success: false, message: "Project ID is required" });
  }
  next();
};

const validateUpdateTaskStatus = (req, res, next) => {
  const validStatuses = ["todo", "in-progress", "done"];
  const { status } = req.body;
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Status must be one of: todo, in-progress, done" });
  }
  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateCreateProject,
  validateCreateTask,
  validateUpdateTaskStatus,
};
