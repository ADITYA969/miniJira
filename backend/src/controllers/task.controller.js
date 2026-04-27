const Task = require("../models/Task");
const Project = require("../models/Project");
const { sendSuccess, sendError } = require("../utils/response");
const { isValidStatusTransition } = require("../utils/validation");

const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;
    const projectDoc = await Project.findById(project);
    if (!projectDoc) return sendError(res, "Project not found", 404);

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
      priority: priority || "medium",
      dueDate: dueDate || null,
    });

    await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" },
      { path: "project", select: "name" },
    ]);

    sendSuccess(res, task, "Task created successfully", 201);
  } catch (err) {
    next(err);
  }
};

const getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    sendSuccess(res, tasks);
  } catch (err) {
    next(err);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate("project", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    sendSuccess(res, tasks);
  } catch (err) {
    next(err);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });
    sendSuccess(res, tasks);
  } catch (err) {
    next(err);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, "Task not found", 404);

    const isAssigned = task.assignedTo?.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isAssigned && !isAdmin) {
      return sendError(res, "You can only update status of tasks assigned to you", 403);
    }

    const { status } = req.body;
    if (!isAdmin && !isValidStatusTransition(task.status, status)) {
      return sendError(res, `Cannot move status from ${task.status} to ${status}. Status must move forward.`);
    }

    task.status = status;
    await task.save();
    sendSuccess(res, task, "Task status updated");
  } catch (err) {
    next(err);
  }
};

const assignTask = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { assignedTo }, { new: true }).populate("assignedTo", "name email");
    if (!task) return sendError(res, "Task not found", 404);
    sendSuccess(res, task, "Task assigned successfully");
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, "Task not found", 404);

    const isAssigned = task.assignedTo?.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isAssigned && !isAdmin) {
      return sendError(res, "You can only edit tasks assigned to you", 403);
    }

    const allowedUpdates = ["title", "description", "priority", "dueDate"];
    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");
    sendSuccess(res, updated, "Task updated successfully");
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return sendError(res, "Task not found", 404);
    sendSuccess(res, null, "Task deleted successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getMyTasks,
  getAllTasks,
  updateTaskStatus,
  assignTask,
  updateTask,
  deleteTask,
};
