import axios, { type AxiosInstance } from "axios";
const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:8787/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
