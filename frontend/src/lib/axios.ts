import axios from "axios";

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("onrender.com")) {
      const backendHost = host.replace("-frontend", "-backend").replace("frontend", "backend");
      return `https://${backendHost}/api`;
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
};

const api = axios.create({
  timeout: 60000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

