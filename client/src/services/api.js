import axios from "axios";

// Une instance Axios pré-configurée avec l'URL de base de ton API
const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// Intercepteur : avant CHAQUE requête, on attache le token s'il existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;