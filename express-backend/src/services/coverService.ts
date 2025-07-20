/**
 * Saves an uploaded cover image file to disk.
 *
 * @param file - The file object received from multer
 * @returns The filename under which the image was saved
 */
export const saveCoverImage = async (file: Express.Multer.File): Promise<string> => {
  // TODO: Implement in src/services/impl/coverService.ts
  return "";
};

/**
 * Returns the absolute path to a cover image by filename.
 *
 * @param filename - The cover image filename
 * @returns The absolute path to the image on disk
 */
export const getCoverImagePath = (filename: string): string => {
  // TODO: Implement in src/services/impl/coverService.ts
  return "";
};
