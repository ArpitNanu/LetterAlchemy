import apiClient from "../lib/api";

export const login = async (credentials: { email: string; password: any }) => {
  try {
    const response = await apiClient.post("/signin", credentials);
    return response.data;
  } catch (error: any) {
    console.error(error.reponse?.data || error.message);
    throw error;
  }
};

export const signUp = async (credential: {
  email: string;
  firstName: string;
  lastName: string;
  password: any;
  bio?: string;
  socialLinks?: any;
}) => {
  try {
    const reponse = await apiClient.post("/signup", credential);
    return reponse.data;
  } catch (error: any) {
    console.error(error.reponse?.data || error.message);
    throw error;
  }
};
