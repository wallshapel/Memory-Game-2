export interface coverService {
  processCoverUpload(username: string, filename: string): Promise<string>;
}
