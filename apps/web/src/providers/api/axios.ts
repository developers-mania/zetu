import axios from "axios";

/** Import API URL from .env */
const ROOT_URL = `${import.meta.env.VITE_API_URL}`;

/** Create an axios instance */
const axiosInstance = axios.create({
  baseURL: ROOT_URL,
  headers: {
    "Content-Type": "application/json", // Standard header
  },
});

/** Create a request interceptor */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("x-token");

    if (token) {
      /**Make sure the token isn't stored with extra quotes if useLocalStorage stringified it */
      const actualToken =
        token.startsWith('"') && token.endsWith('"')
          ? JSON.parse(token)
          : token;
      config.headers["Authorization"] = `Bearer ${actualToken}`;
    }

    return config;
  },
  (error) => {
    /** Do something with request error */
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

/** Handle Forbidden and Unauthorized errors */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("Response Error:", error);
    const config = error.config; // Original request config

    /**Check if error.response exists (network errors might not have it) */
    if (error.response) {
      const status = error.response.status;

      /** Handle 401 Unauthorized error */
      if (status === 401 /* && !config._retry */) {
        // Add retry logic here if implementing token refresh
        console.warn("Unauthorized access (401). Logging out...");
        // Use dynamic import ONLY WHEN NEEDED inside the function
        try {
          // const { useAuthStore } = await import("@/store/auth.store");
          // const authStore = useAuthStore();
          // /** Perform logout or redirect to the login page */
          // authStore.logout();
        } catch (importError) {
          console.error("Failed to import authStore for logout:", importError);
        }
      }

      /** Handle 403 Forbidden error */
      if (status === 403) {
        console.warn("Access forbidden (403).");
        // Maybe redirect to an 'access denied' page or show a message
        // Depending on requirements, logout might not always be the desired action for 403.
      }
    } else if (error.request) {
      console.error("Network error or no response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }

    /** Reject with the error so store actions can catch it */
    return Promise.reject(error);
  },
);

/** Export wrapped methods for cleaner usage in stores/components */
export default {
  get: (url: string, config?: any) => axiosInstance.get(url, config),
  post: (url: string, data: any, config?: any) => axiosInstance.post(url, data, config),
  patch: (url: string, data: any, config?: any) => axiosInstance.patch(url, data, config),
  put: (url: string, data: any, config?: any) => axiosInstance.put(url, data, config),
  delete: (url: string, config?: any) => axiosInstance.delete(url, config),
};

/** Export the axios instance for direct usage if needed */
export { axiosInstance };
