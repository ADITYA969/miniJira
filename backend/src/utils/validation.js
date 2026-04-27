const validator = require("validator");

const isValidEmail = (email) => validator.isEmail(email);

const isValidPassword = (password) => typeof password === "string" && password.length >= 6;

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

const isValidTaskStatus = (status) => ["todo", "in-progress", "done"].includes(status);

const STATUS_ORDER = ["todo", "in-progress", "done"];

const isValidStatusTransition = (from, to) => {
  const fromIndex = STATUS_ORDER.indexOf(from);
  const toIndex = STATUS_ORDER.indexOf(to);
  return toIndex > fromIndex;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isNonEmptyString,
  isValidObjectId,
  isValidTaskStatus,
  isValidStatusTransition,
};
