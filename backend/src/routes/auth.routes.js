const express = require("express");
const { signup, login, bootstrapAdmin } = require("../controllers/auth.controller");
const { validateSignup, validateLogin } = require("../middleware/validate");

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.post("/bootstrap-admin", bootstrapAdmin);

module.exports = router;
