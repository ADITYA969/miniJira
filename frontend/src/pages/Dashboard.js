import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProjects } from "../api/project.api";
import { getMyTasks, getAllTasks } from "../api/task.api";
import Navbar from "../components/layout/Navbar";

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, taskRes] = await Promise.all([
          getProjects(),
          user.role === "admin" ? getAllTasks() : getMyTasks(),
        ]);
        setProjects(projectRes.data.data);
        setTasks(taskRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const taskCounts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h2>Welcome back, {user?.name}</h2>
          <p>Here is an overview of your workspace</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{projects.length}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-card stat-todo">
            <span className="stat-number">{taskCounts.todo}</span>
            <span className="stat-label">To Do</span>
          </div>
          <div className="stat-card stat-progress">
            <span className="stat-number">{taskCounts.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card stat-done">
            <span className="stat-number">{taskCounts.done}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <div className="section-header">
              <h3>Recent Projects</h3>
              <Link to="/projects" className="btn btn-sm btn-outline">View all</Link>
            </div>
            {projects.length === 0 ? (
              <p className="empty-state">No projects yet.</p>
            ) : (
              <div className="project-list">
                {projects.slice(0, 5).map((p) => (
                  <Link to={`/projects/${p._id}`} key={p._id} className="project-item">
                    <div className="project-item-name">{p.name}</div>
                    <div className="project-item-meta">{p.members.length} members</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="section">
            <div className="section-header">
              <h3>{user.role === "admin" ? "All Tasks" : "My Tasks"}</h3>
              <Link to="/my-tasks" className="btn btn-sm btn-outline">View all</Link>
            </div>
            {tasks.length === 0 ? (
              <p className="empty-state">No tasks assigned.</p>
            ) : (
              <div className="task-list">
                {tasks.slice(0, 5).map((t) => (
                  <div key={t._id} className="task-item">
                    <div className="task-item-title">{t.title}</div>
                    <div className="task-item-meta">
                      <span className={`status-badge status-${t.status}`}>{t.status}</span>
                      <span className={`priority-badge priority-${t.priority}`}>{t.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
