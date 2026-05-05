// postApi.ts
import apiClient from "@/lib/api";

export const getLatestDraft = async () => {
  const res = await apiClient.get("/posts/latest");
  return res.data;
};

export const createDraft = async (data: {
  title: string;
  content: any;
}) => {
  const res = await apiClient.post("/create", data);
  return res.data;
};

export const updateDraft = async (
  id: number,
  data: { title: string; content: any },
) => {
  const res = await apiClient.patch(`/edit/${id}`, data);
  return res.data;
};

export const publishingDraft = async (id: number) => {
  const res = await apiClient.patch(`/publish/${id}`);
  return res.data;
};

export const getPublicPost = async () => {
  const res = await apiClient.get("/public");
  return res.data;
};

export const getPostById = async (id: string | undefined) => {
  if (!id) return { success: false, msg: "No ID provided" };
  const res = await apiClient.get(`/posts/${id}`);
  return res.data;
};

export const getPublicPostById = async (id: string | undefined) => {
  if (!id) return { success: false, msg: "No ID provided" };
  const res = await apiClient.get(`/public/${id}`);
  return res.data;
};

// NEW: Fetches a post using its human-readable slug string.
// This is now the primary function ReaderPage will use.
// The backend route is GET /public/slug/:slug
// e.g., getPublicPostBySlug("my-first-post") → hits /public/slug/my-first-post
export const getPublicPostBySlug = async (slug: string | undefined) => {
  // Guard clause: if no slug is provided (undefined/empty), bail early.
  // This prevents a useless network request to /public/slug/undefined.
  if (!slug) return { success: false, msg: "No slug provided" };
  const res = await apiClient.get(`/public/slug/${slug}`);
  return res.data;
};

export const getAiPrompts = async () => {
  const res = await apiClient.get("/prompts");
  return res.data;
};

export const getAllUserPosts = async () => {
  const res = await apiClient.get("/posts");
  return res.data;
};

export const deletePost = async (id: number) => {
  const res = await apiClient.delete(`/posts/${id}`);
  return res.data;
};

export const toggleLike = async (id: string | number) => {
  const res = await apiClient.post(`/like/${id}`);
  return res.data;
};

export const toggleBookmark = async (id: string | number) => {
  const res = await apiClient.post(`/bookmark/${id}`);
  return res.data;
};

export const getBookmarkedPosts = async () => {
  const res = await apiClient.get("/bookmarks");
  return res.data;
};

export const searchPublicPosts = async (query: string) => {
  const res = await apiClient.get(`/public/search?q=${query}`);
  return res.data;
};
