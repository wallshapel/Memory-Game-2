import path from "path";

/**
 * Saves an uploaded cover image file to disk.
 * 
 * @param file - The file object received from multer
 * @returns The filename under which the image was saved
 */
export const saveCoverImage = async (file: Express.Multer.File): Promise<string> => {
  // TODO: Move the uploaded file from temp location to public/uploads/covers
  // and return the new filename
  return "";
};

/**
 * Returns the absolute path to a cover image by filename.
 *
 * @param filename - The cover image filename
 * @returns The absolute path to the image on disk
 */
export const getCoverImagePath = (filename: string): string => {
  // Path updated to match new covers directory
  return path.join(__dirname, "..", "public", "uploads", "images", "covers", filename);
};
