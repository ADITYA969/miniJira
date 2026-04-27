const express = require("express");
const { createProject, getProjects, getProjectById, addMember, removeMember, deleteProject } = require("../controllers/project.controller");
const authMiddleware = require("../middleware/auth");
const { requireActive, requireRole } = require("../middleware/role");
const { validateCreateProject } = require("../middleware/validate");

const router = express.Router();

router.use(authMiddleware);
router.use(requireActive);

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", requireRole("admin"), validateCreateProject, createProject);
router.post("/:id/members", requireRole("admin"), addMember);
router.delete("/:id/members/:userId", requireRole("admin"), removeMember);
router.delete("/:id", requireRole("admin"), deleteProject);

module.exports = router;
