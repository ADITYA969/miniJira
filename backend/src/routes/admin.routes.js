const express = require("express");
const { getAllUsers, getPendingUsers, approveUser, deleteUser, updateUserRole } = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth");
const { requireActive, requireRole } = require("../middleware/role");

const router = express.Router();

router.use(authMiddleware);
router.use(requireActive);
router.use(requireRole("admin"));

router.get("/users", getAllUsers);
router.get("/users/pending", getPendingUsers);
router.patch("/users/:id/approve", approveUser);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

module.exports = router;
