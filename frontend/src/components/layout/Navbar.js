import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">MiniJira</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>Dashboard</Link>
        <Link to="/projects" className={isActive("/projects") ? "active" : ""}>Projects</Link>
        <Link to="/my-tasks" className={isActive("/my-tasks") ? "active" : ""}>My Tasks</Link>
        {user?.role === "admin" && (
          <Link to="/admin" className={isActive("/admin") ? "active" : ""}>Admin</Link>
        )}
      </div>
      <div className="navbar-user">
        <span className="user-name">{user?.name}</span>
        <span className={`badge ${user?.role === "admin" ? "badge-admin" : "badge-member"}`}>
          {user?.role}
        </span>
        <button onClick={handleLogout} className="btn btn-logout">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
