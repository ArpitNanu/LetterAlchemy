import apiClient from "@/lib/api";

export const getComments = async (postId: number) => {
  try {
    const response = await apiClient.get(`/comments/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { success: false, message: "Failed to fetch" };
  }
};

export const createComment = async (postId: number, text: string) => {
  try {
    const response = await apiClient.post(`/comments/${postId}`, { text });
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, message: "Failed to post" };
  }
};

export const deleteComment = async (commentId: number) => {
  try {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, message: "Failed to delete" };
  }
};
