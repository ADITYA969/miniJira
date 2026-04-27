const Project = require("../models/Project");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id],
    });
    sendSuccess(res, project, "Project created successfully", 201);
  } catch (err) {
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { members: req.user.id };
    const projects = await Project.find(query)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });
    sendSuccess(res, projects);
  } catch (err) {
    next(err);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email");
    if (!project) return sendError(res, "Project not found", 404);
    sendSuccess(res, project);
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return sendError(res, "User not found", 404);
    if (user.status !== "active") return sendError(res, "Only active users can be added to a project");

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate("members", "name email");
    if (!project) return sendError(res, "Project not found", 404);
    sendSuccess(res, project, "Member added successfully");
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: req.params.userId } },
      { new: true }
    ).populate("members", "name email");
    if (!project) return sendError(res, "Project not found", 404);
    sendSuccess(res, project, "Member removed successfully");
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return sendError(res, "Project not found", 404);
    sendSuccess(res, null, "Project deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = { createProject, getProjects, getProjectById, addMember, removeMember, deleteProject };
