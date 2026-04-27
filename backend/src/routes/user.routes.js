const express = require("express");
const { getProfile, updateProfile } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth");
const { requireActive } = require("../middleware/role");

const router = express.Router();

router.use(authMiddleware);
router.use(requireActive);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;
