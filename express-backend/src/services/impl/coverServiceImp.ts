// src/services/impl/coverServiceImp.ts
import { CoverService } from "../coverService";
import { CoverRepository } from "../../repositories/CoverRepository";
import { CoverRepositoryImp } from "../../repositories/impl/CoverRepositoryImp";
import { FileManager } from "../../utils/FileManager";
import { ROOT_PATH } from "../../utils/rootPath";

/**
 * Service implementation for processing cover uploads.
 */
export class CoverServiceImp implements CoverService {
  private coverRepository: CoverRepository;

  constructor(coverRepository: CoverRepository = new CoverRepositoryImp()) {
    this.coverRepository = coverRepository;
  }

  async processCoverUpload(
    username: string,
    filename: string
  ): Promise<string> {
    if (!username || username.trim().length === 0)
      throw new Error("Username is required to upload a cover image.");

    // Find previous cover for user
    const coverInfo = await this.coverRepository.findCoverByUsername(username);

    // Delete previous image if exists
    if (coverInfo && coverInfo.coverFileName) {
      const oldPath = FileManager.getCoverImagePath(
        ROOT_PATH,
        coverInfo.coverFileName
      );
      FileManager.delete(oldPath);
    }

    // Update with new cover information
    await this.coverRepository.updateCover(username, filename, "uploaded");

    return filename;
  }
}
