// src/utils/api.js
import axios from "axios";
import { backendUrl } from "../config/config";

const api = axios.create({
  baseURL: `${backendUrl}/api`, // 🔹 change this to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
