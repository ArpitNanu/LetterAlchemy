import apiClient from "@/lib/api";

const createDraft = async (data: { title: string; content: any }) => {
  const res = await apiClient.post("/create", {
    title: data.title,
    content: data.content,
    published: false,
  });
  return res.data;
};

const updateDraft = async (
  id: number,
  data: { title: string; content: any },
) => {
  const res = await apiClient.patch(`/edit/${id}`, {
    title: data.title,
    content: data.content,
    published: false,
  });
  return res.data;
};

const getLatestDraft = async () => {
  const res = await apiClient.get(`/posts/latest`);
  return res.data;
};

export { createDraft, updateDraft, getLatestDraft };
