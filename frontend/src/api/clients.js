import {
  safeApiGet,
  safeApiPost,
  safeApiPut,
  safeApiDelete,
} from "@/lib/safeApiGet";

export const getClients = (params) => {
  return safeApiGet("/api/clients", { params });
};

export const getClientById = (id) => {
  return safeApiGet(`/api/clients/${id}`);
};

export const createClient = (payload) => {
  return safeApiPost("/api/clients", payload, {
    successMessage: "Client created successfully!",
    errorMessage: "Failed to create client.",
  });
};

export const updateClient = (id, payload) => {
  return safeApiPut(`/api/clients/${id}`, payload, {
    successMessage: "Client updated successfully!",
    errorMessage: "Failed to update client.",
  });
};

export const deleteClient = (id) => {
  return safeApiDelete(`/api/clients/${id}`, {
    successMessage: "Client deleted successfully!",
    errorMessage: "Failed to delete client.",
  });
};
