// src/services/impl/coverServiceImp.ts
import fs from "fs";
import path from "path";
import UserSettings from "../../models/UserSettings";
import { coverService } from "../coverService";
import { ROOT_PATH } from "../../utils/rootPath";

export class CoverServiceImp implements coverService {
  async processCoverUpload(
    username: string,
    filename: string
  ): Promise<string> {
    if (!username || username.trim().length === 0)
      throw new Error("User name is required to upload a cover image.");

    // Search for the user's document
    const userSettings = await UserSettings.findOne({ name: username });
    if (userSettings && userSettings.coverFileName) {
      // Delete the previous image, if it exists
      const oldPath = path.join(
        ROOT_PATH,
        "public/uploads/images/covers",
        userSettings.coverFileName
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    // Update the field coverFileName and coverType
    await UserSettings.findOneAndUpdate(
      { name: username },
      { coverFileName: filename, coverType: "uploaded" },
      { new: true, upsert: false }
    );
    return filename;
  }
}
