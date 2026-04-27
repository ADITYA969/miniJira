import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyTasks, getAllTasks, updateTaskStatus } from "../api/task.api";
import Navbar from "../components/layout/Navbar";

const MyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await (user.role === "admin" ? getAllTasks() : getMyTasks());
        setTasks(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user]);

  const handleStatusChange = async (taskId, newStatus, currentStatus) => {
    const order = ["todo", "in-progress", "done"];
    if (order.indexOf(newStatus) <= order.indexOf(currentStatus) && user.role !== "admin") {
      alert("Status can only move forward");
      return;
    }
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert(err.response?.data?.message || "Cannot update status");
    }
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h2>{user.role === "admin" ? "All Tasks" : "My Tasks"}</h2>
          <div className="filter-tabs">
            {["all", "todo", "in-progress", "done"].map((f) => (
              <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state-box">No tasks found.</div>
        ) : (
          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Assigned To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.project?.name || "N/A"}</td>
                    <td><span className={`priority-badge priority-${task.priority}`}>{task.priority}</span></td>
                    <td><span className={`status-badge status-${task.status}`}>{task.status}</span></td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</td>
                    <td>{task.assignedTo?.name || "Unassigned"}</td>
                    <td>
                      {task.status !== "done" && (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value, task.status)}
                          className="status-select"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      )}
                      {task.status === "done" && <span className="text-muted">Completed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTasks;
