import axios from "axios";

// Read API URL from Vite environment variables (fallback to port 3001)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject JWT bearer token into every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("taskbox_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle unified api-response envelope
api.interceptors.response.use(
  (response) => {
    // If our backend sends { success: true, data: ... }
    if (response.data && response.data.success) {
      return response.data; // Return only the data payload
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);
