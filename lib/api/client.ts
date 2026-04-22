import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

// Request Interceptor (attached Bearer token to every outgoing request)
api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor (attempts silent token refresh then retry on 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        const res = await axios.post(
           `${API_URL}/api/auth/token/refresh/`,
          { refresh: refreshToken},
          { withCredentials: true }
        );

        const newAccessToken = res.data.access;
        Cookies.set("accessToken", newAccessToken, { sameSite: "strict"});

        // Retry the origin request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh failed (clear tokens and redirect to login)
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;