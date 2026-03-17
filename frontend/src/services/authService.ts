import apiClient from "../lib/api";

const login = async (credentials: { email: string; password: any }) => {
  try {
    const reponse = await apiClient.post("/auth/login", credentials);
    return reponse.data;
  } catch (error: any) {
    console.error(error.reponse?.data || error.message);
    throw error;
  }
};

export default login;
