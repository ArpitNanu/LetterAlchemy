import apiClient from "@/lib/api";

const createDraft = async (data: { title: string }) => {
  const res = await apiClient.post("/create", {
    title: data.title,
    published: false,
  });
  return res.data;
};

const updateDraft = async (id: number, data: { title: string }) => {
  const res = await apiClient.patch(`/edit/${id}`, {
    title: data.title,
    published: false,
  });
  return res.data;
};
export { createDraft, updateDraft };
