import api from "./axios";

export const getAllUsers = () => api.get("/admin/users");
export const getPendingUsers = () => api.get("/admin/users/pending");
export const approveUser = (id) => api.patch(`/admin/users/${id}/approve`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
