const express = require("express");
const {
  createTask,
  getTasksByProject,
  getMyTasks,
  getAllTasks,
  updateTaskStatus,
  assignTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");
const authMiddleware = require("../middleware/auth");
const { requireActive, requireRole } = require("../middleware/role");
const { validateCreateTask, validateUpdateTaskStatus } = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware);
router.use(requireActive);

router.get("/", requireRole("admin"), getAllTasks);
router.get("/my", getMyTasks);
router.get("/project/:projectId", getTasksByProject);
router.post("/", validateCreateTask, createTask);
router.patch("/:id/status", validateUpdateTaskStatus, updateTaskStatus);
router.patch("/:id/assign", requireRole("admin"), assignTask);
router.put("/:id", updateTask);
router.delete("/:id", requireRole("admin"), deleteTask);

module.exports = router;
