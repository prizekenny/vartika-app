import api from "@/lib/axios";

export const getUsers = () => {
  return api.get("/api/users");
};

export const updateUserStatus = (userId, status) => {
  return api.put(`/api/users/${userId}`, { status });
};

export const deleteUser = (userId) => {
  return api.delete(`/api/users/${userId}`);
};

export const updateUser = (userId, data) => {
  return api.put(`/api/users/${userId}`, data);
};

export const getUsersWithoutClient = () => {
  return api.get("/api/users/without-client");
};

export const createUser = (userData) => {
  return api.post("/api/users", userData);
};
