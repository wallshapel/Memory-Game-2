import api from "./apiConfig";

export const uploadCover = async (file: File, username: string) => {
  const formData = new FormData();
  formData.append("cover", file);
  formData.append("username", username);

  const { data } = await api.post<{ filename: string }>("/covers", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
