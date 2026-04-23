import axios, { type AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:8787/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Call this once after login to set the token on all future requests
export const setAuthToken = (token: string | null) => {
  if (token && token !== "undefined" && token !== "null") {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Auth token set on apiClient");
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
    console.log("Auth token removed from apiClient");
  }
};

// On app load, restore the token from localStorage immediately
const storedToken = localStorage.getItem("token");
setAuthToken(storedToken);

export default apiClient;
