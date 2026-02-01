import axios from "axios";

const api = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor - handle auth errors globally
api.interceptors.response.use(
  (response) => {
    // Check success response but with UNAUTHORIZED in body
    if (response.data?.error?.code === "UNAUTHORIZED") {
      if (typeof window !== "undefined") {
        window.location.replace("/sign-in");
      }
    }
    return response;
  },
  (error) => {
    // Check for 401 or UNAUTHORIZED error
    if (
      error.response?.status === 401 ||
      error.response?.data?.error?.code === "UNAUTHORIZED"
    ) {
      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.replace("/sign-in");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
