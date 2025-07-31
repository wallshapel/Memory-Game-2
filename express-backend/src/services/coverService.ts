// src/services/coverService.ts
export interface CoverService {
  processCoverUpload(username: string, filename: string): Promise<string>;
}
