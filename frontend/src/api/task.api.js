import api from "./axios";

export const getTasksByProject = (projectId) => api.get(`/tasks/project/${projectId}`);
export const getMyTasks = () => api.get("/tasks/my");
export const getAllTasks = () => api.get("/tasks");
export const createTask = (data) => api.post("/tasks", data);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const assignTask = (id, assignedTo) => api.patch(`/tasks/${id}/assign`, { assignedTo });
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
