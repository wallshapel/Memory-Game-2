// src/utils/FileManager.ts
import fs from "fs";
import path from "path";

export class FileManager {
  /**
   * Checks if a file exists at the given path.
   */
  static exists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Deletes the file at the given path.
   */
  static delete(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Returns the absolute path to a cover image by filename.
   */
  static getCoverImagePath(rootPath: string, filename: string): string {
    return path.join(rootPath, "public/uploads/images/covers", filename);
  }
}
