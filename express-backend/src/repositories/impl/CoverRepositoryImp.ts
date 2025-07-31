// src/repositories/impl/CoverRepositoryImp.ts
import UserSettings from "../../models/UserSettings";
import { CoverRepository } from "../CoverRepository";

/**
 * Mongoose-based implementation of CoverRepository.
 */
export class CoverRepositoryImp implements CoverRepository {
  async findCoverByUsername(
    username: string
  ): Promise<{ coverFileName?: string } | null> {
    const result = await UserSettings.findOne(
      { name: username },
      "coverFileName"
    ).lean();
    if (!result) return null;
    return { coverFileName: result.coverFileName };
  }

  async updateCover(
    username: string,
    coverFileName: string,
    coverType: "uploaded"
  ): Promise<void> {
    await UserSettings.findOneAndUpdate(
      { name: username },
      { coverFileName, coverType },
      { new: true, upsert: false }
    );
  }
}
