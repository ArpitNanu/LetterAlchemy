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

