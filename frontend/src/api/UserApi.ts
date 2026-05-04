import apiClient from "@/lib/api";

/**
 * Fetches the current user's profile information, including stats (likes, comments, views).
 */
export const getUserProfile = async () => {
  const res = await apiClient.get("/users/profile");
  return res.data;
};

/**
 * Sends a PATCH request to update the authenticated user's bio.
 * Uses a partial update so only the bio field is touched in the DB.
 */
export const updateUserBio = async (bio: string) => {
  const res = await apiClient.patch("/users/update-profile", { bio });
  return res.data;
};
