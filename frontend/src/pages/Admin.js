import React, { useEffect, useState } from "react";
import { getAllUsers, approveUser, deleteUser, updateUserRole } from "../api/admin.api";
import Navbar from "../components/layout/Navbar";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      setUsers(users.map((u) => u._id === id ? { ...u, status: "active" } : u));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);
      setUsers(users.map((u) => u._id === id ? { ...u, role } : u));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const filtered = tab === "all" ? users : users.filter((u) => u.status === tab);

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h2>Admin Panel</h2>
          <div className="admin-stats">
            <span className="stat-pill">{users.length} Total</span>
            <span className="stat-pill stat-pill-warn">{users.filter((u) => u.status === "pending").length} Pending</span>
            <span className="stat-pill stat-pill-success">{users.filter((u) => u.status === "active").length} Active</span>
          </div>
        </div>

        <div className="filter-tabs">
          {["all", "pending", "active"].map((t) => (
            <button key={t} className={`filter-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state-box">No users found.</div>
        ) : (
          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-badge ${u.status === "active" ? "status-done" : "status-todo"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="action-cell">
                      {u.status === "pending" && (
                        <button className="btn btn-xs btn-success" onClick={() => handleApprove(u._id)}>Approve</button>
                      )}
                      <button className="btn btn-xs btn-danger" onClick={() => handleDelete(u._id)}>Delete</button>
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

export default Admin;
