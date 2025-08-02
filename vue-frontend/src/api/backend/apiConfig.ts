// src/api/backend/apiConfig.ts
import axios from "axios";

// Create an Axios instance configured with the base URL for the backend API.
// All API requests in this project will use this instance.
const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

export default api;
