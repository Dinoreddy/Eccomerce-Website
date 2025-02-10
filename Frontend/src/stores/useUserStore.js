import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Password doesn't match");
    }

    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      set({ user: res.data, loading: false });
      toast.success(res.data.message);
    } catch (err) {
      set({ loading: false });
      toast.error(err.response.data.message);
    }
  },
  login: async ({ email, password }) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });
      set({ user: res.data, loading: false });
      toast.success(res.data.message);
    } catch (err) {
      set({ loading: false });
      console.log(err);
      toast.error(err.response.data.message);
    }
  },
  checkAuth: async () => {
    // Use set with a function to get the most recent state
    set((state) => ({ checkingAuth: true }));
    
    try {
      console.log("Checking authentication...");
      const res = await axios.get("/auth/getprofile");
      console.log("Profile data:", res.data);
      
      // Use set with a function to ensure you're working with the latest state
      set((state) => ({ 
        user: res.data, 
        checkingAuth: false 
      }));
      
      // If you want to log the current state, use get()
      console.log("Current state after auth check:", get());
    } catch (error) {
      console.error("Auth check error:", error.response);
      
      set((state) => ({ 
        checkingAuth: false, 
        user: null 
      }));
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error(err.response.data);
    }
  },
  refreshToken: async () => {
    console.log("[REFRESH TOKEN] Starting refresh process");
    
    set({ checkingAuth: true });
    
    try {
      console.log("[REFRESH TOKEN] Sending refresh token request");
      const response = await axios.post("/auth/refreshToken", {}, {
        // Add extra logging and timeout
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("[REFRESH TOKEN] Full response:", {
        status: response.status,
        data: response.data
      });
      
      set((state) => ({ 
        user: response.data, // Update user with new token info
        checkingAuth: false 
      }));
      
      return response.data;
    } catch (error) {
      console.error("[REFRESH TOKEN] Refresh failed:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
      // Detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("[REFRESH TOKEN] Response error:", error.response.data);
        console.error("[REFRESH TOKEN] Response status:", error.response.status);
        console.error("[REFRESH TOKEN] Response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("[REFRESH TOKEN] No response received:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("[REFRESH TOKEN] Error setting up request:", error.message);
      }
      
      set({ 
        user: null, 
        checkingAuth: false 
      });
      
      throw error;
    }
  }
}));

// Axios interceptor with more robust error handling
let refreshPromise = null;
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("[INTERCEPTOR] Caught error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    const originalRequest = error.config;
    
    // Only retry for 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[INTERCEPTOR] Attempting to refresh token");
      
      originalRequest._retry = true;
      
      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          console.log("[INTERCEPTOR] Waiting for existing refresh promise");
          await refreshPromise;
          return axios(originalRequest);
        }
        
        // Start a new refresh process
        console.log("[INTERCEPTOR] Starting new refresh process");
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;
        
        console.log("[INTERCEPTOR] Retrying original request");
        return axios(originalRequest);
      } catch (refreshError) {
        console.error("[INTERCEPTOR] Token refresh failed", refreshError);
        
        // If refresh fails, logout the user
        useUserStore.getState().logout();
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);