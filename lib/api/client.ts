import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

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

        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );


        return api(originalRequest);
      } catch (err) {

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