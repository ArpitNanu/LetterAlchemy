import apiClient from "@/lib/api";

/**
 * Fetches the current user's profile information, including stats (likes, comments, views).
 */
export const getUserProfile = async () => {
  const res = await apiClient.get("/users/profile");
  return res.data;
};

// You can add more user-related functions here later (update profile, etc.)
