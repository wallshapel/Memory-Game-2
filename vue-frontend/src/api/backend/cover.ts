// src/api/backend/cover.ts
import api from "./apiConfig";

/**
 * Uploads a cover image to the backend.
 *
 * @param file - The image file to upload.
 * @param username - The username to associate with the uploaded cover.
 * @returns The server response containing the uploaded filename.
 */
export const uploadCover = async (file: File, username: string) => {
  const formData = new FormData();
  formData.append("cover", file);
  formData.append("username", username);

  // POST the FormData to the /covers endpoint with multipart/form-data header.
  const { data } = await api.post<{ filename: string }>("/covers", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
