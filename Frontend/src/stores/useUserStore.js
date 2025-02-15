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
    

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refreshToken");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
  }
}));

// Axios interceptor with more robust error handling
let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);