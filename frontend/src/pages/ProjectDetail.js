import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProjectById, addMember, removeMember } from "../api/project.api";
import { getTasksByProject, createTask, updateTaskStatus, assignTask, deleteTask } from "../api/task.api";
import { getAllUsers } from "../api/admin.api";
import Navbar from "../components/layout/Navbar";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", assignedTo: "", dueDate: "" });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [memberUserId, setMemberUserId] = useState("");

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        getProjectById(id),
        getTasksByProject(id),
      ]);
      setProject(projRes.data.data);
      setTasks(taskRes.data.data);
      if (user.role === "admin") {
        const usersRes = await getAllUsers();
        setAllUsers(usersRes.data.data.filter((u) => u.status === "active"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) { setError("Task title is required"); return; }
    setSubmitting(true);
    try {
      await createTask({ ...taskForm, project: id });
      setTaskForm({ title: "", description: "", priority: "medium", assignedTo: "", dueDate: "" });
      setShowTaskForm(false);
      const res = await getTasksByProject(id);
      setTasks(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert(err.response?.data?.message || "Cannot update status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleAddMember = async () => {
    if (!memberUserId) return;
    try {
      await addMember(id, memberUserId);
      setMemberUserId("");
      const res = await getProjectById(id);
      setProject(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await removeMember(id, userId);
      const res = await getProjectById(id);
      setProject(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  const columns = [
    { key: "todo", label: "To Do" },
    { key: "in-progress", label: "In Progress" },
    { key: "done", label: "Done" },
  ];

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!project) return <div className="loading-screen">Project not found</div>;

  const nonMembers = allUsers.filter((u) => !project.members.find((m) => m._id === u._id));

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h2>{project.name}</h2>
            <p>{project.description || "No description"}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowTaskForm(!showTaskForm)}>
            {showTaskForm ? "Cancel" : "Add Task"}
          </button>
        </div>

        {showTaskForm && (
          <div className="card form-card">
            <h3>New Task</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreateTask}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={taskForm.title}
                    onChange={(e) => { setTaskForm({ ...taskForm, title: e.target.value }); setError(""); }}
                    placeholder="Task title" />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assign To</label>
                  <select value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                    <option value="">Unassigned</option>
                    {project.members.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Optional description" rows={2} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Creating..." : "Create Task"}
              </button>
            </form>
          </div>
        )}

        <div className="kanban-board">
          {columns.map((col) => (
            <div key={col.key} className="kanban-column">
              <div className={`kanban-column-header column-${col.key}`}>
                <span>{col.label}</span>
                <span className="column-count">{tasks.filter((t) => t.status === col.key).length}</span>
              </div>
              <div className="kanban-cards">
                {tasks.filter((t) => t.status === col.key).map((task) => {
                  const isAssigned = task.assignedTo?._id === user.id;
                  const isAdmin = user.role === "admin";
                  return (
                    <div key={task._id} className="kanban-card">
                      <div className="kanban-card-title">{task.title}</div>
                      {task.description && <p className="kanban-card-desc">{task.description}</p>}
                      <div className="kanban-card-meta">
                        <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                        {task.assignedTo && <span className="assignee">{task.assignedTo.name}</span>}
                        {task.dueDate && <span className="due-date">{new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                      {(isAssigned || isAdmin) && (
                        <div className="kanban-card-actions">
                          {col.key !== "done" && (
                            <button className="btn btn-xs btn-outline"
                              onClick={() => handleStatusChange(task._id, col.key === "todo" ? "in-progress" : "done")}>
                              Move to {col.key === "todo" ? "In Progress" : "Done"}
                            </button>
                          )}
                          {isAdmin && (
                            <button className="btn btn-xs btn-danger" onClick={() => handleDeleteTask(task._id)}>
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {tasks.filter((t) => t.status === col.key).length === 0 && (
                  <div className="kanban-empty">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {user.role === "admin" && (
          <div className="card members-card">
            <h3>Members</h3>
            <div className="members-list">
              {project.members.map((m) => (
                <div key={m._id} className="member-row">
                  <span>{m.name} ({m.email})</span>
                  <button className="btn btn-xs btn-danger" onClick={() => handleRemoveMember(m._id)}>Remove</button>
                </div>
              ))}
            </div>
            {nonMembers.length > 0 && (
              <div className="add-member-row">
                <select value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)}>
                  <option value="">Select user to add</option>
                  {nonMembers.map((u) => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm" onClick={handleAddMember}>Add Member</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetail;
