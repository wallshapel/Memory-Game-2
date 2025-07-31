// src/repositories/CoverRepository.ts
export interface CoverRepository {
  /**
   * Finds the cover information for a given username.
   */
  findCoverByUsername(
    username: string
  ): Promise<{ coverFileName?: string } | null>;

  /**
   * Updates the cover information for a given username.
   */
  updateCover(
    username: string,
    coverFileName: string,
    coverType: "uploaded"
  ): Promise<void>;
}
