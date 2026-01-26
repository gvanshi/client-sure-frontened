// import axios from "axios";

// const Axios = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
//   withCredentials: true,
//   timeout: 30000, // 30 seconds timeout
//   headers: {
//     'Content-Type': 'application/json',
//   }
// });

// // Request interceptor for error handling
// Axios.interceptors.request.use(
//   (config) => {
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// Axios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.code === 'ECONNABORTED') {
//       console.error('Request timeout');
//     }
//     return Promise.reject(error);
//   }
// );

// export default Axios;
import axios from "axios";

// const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
// const baseURL =  "https://client-sure-backend.vercel.app/api";
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 60000, // 60 seconds for AI generation
});

// Add connection test
const testConnection = async () => {
  try {
    await Axios.get("/health");
    console.log("✅ Backend connection successful");
  } catch (error) {
    console.warn("⚠️ Backend connection failed:", baseURL);
  }
};

// Test connection on load
if (typeof window !== "undefined") {
  testConnection();
}

// Request interceptor to add auth token
Axios.interceptors.request.use(
  (config) => {
    // Check for admin token first, then regular user token
    const adminToken = localStorage.getItem("adminToken");
    const userToken = localStorage.getItem("userToken");

    const token = adminToken || userToken;

    if (token && token !== "undefined" && token !== "null") {
      // Remove quotes if token is stored as JSON string
      const cleanToken = token.replace(/^"|"$/g, "");
      config.headers.authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      const isSessionRevoked = errorData?.sessionRevoked === true;
      const errorMessage = errorData?.error || "Unauthorized";

      // Clear authentication data including userData
      localStorage.removeItem("userToken");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userData");

      // Show appropriate toast message based on error type
      if (typeof window !== "undefined") {
        // Dynamically import toast to avoid SSR issues
        import("sonner").then(({ toast }) => {
          if (isSessionRevoked) {
            // Session was revoked due to device limit
            if (errorMessage.includes("Maximum device limit exceeded")) {
              toast.error(
                "You've been logged out because you logged in from another device",
                {
                  description: "Maximum 2 devices allowed at once",
                  duration: 5000,
                },
              );
            } else if (errorMessage.includes("Token expired")) {
              toast.error("Your session has expired", {
                description: "Please login again",
                duration: 4000,
              });
            } else {
              toast.error("Session invalid", {
                description: "Please login again",
                duration: 4000,
              });
            }
          } else {
            // Generic unauthorized error
            toast.error("Session expired", {
              description: "Please login again",
              duration: 4000,
            });
          }
        });
      }

      // Only redirect if we're not already on a login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/auth/")
      ) {
        // Small delay to allow toast to show
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      }
    }
    return Promise.reject(error);
  },
);

export default Axios;
