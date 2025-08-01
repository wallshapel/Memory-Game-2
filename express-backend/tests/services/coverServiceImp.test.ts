// tests/services/coverServiceImp.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CoverServiceImp } from "../../src/services/impl/coverServiceImp";

// Mocks
const mockFindCoverByUsername = vi.fn();
const mockUpdateCover = vi.fn();

const coverRepositoryMock = {
  findCoverByUsername: mockFindCoverByUsername,
  updateCover: mockUpdateCover,
};

// Mock FileManager methods and ROOT_PATH
vi.mock("../../src/utils/FileManager", () => ({
  FileManager: {
    getCoverImagePath: vi.fn(
      (rootPath: string, filename: string) => `/mockpath/${filename}`
    ),
    delete: vi.fn(),
  },
}));
import { FileManager } from "../../src/utils/FileManager";

// Also, mock ROOT_PATH if you want, but for now, a string works.

describe("CoverServiceImp", () => {
  let service: CoverServiceImp;

  beforeEach(() => {
    mockFindCoverByUsername.mockReset();
    mockUpdateCover.mockReset();
    (FileManager.getCoverImagePath as any).mockClear();
    (FileManager.delete as any).mockClear();
    service = new CoverServiceImp(coverRepositoryMock as any);
  });

  it("should throw if username is empty", async () => {
    await expect(service.processCoverUpload("", "cover.png")).rejects.toThrow(
      "Username is required to upload a cover image."
    );
    await expect(
      service.processCoverUpload("   ", "cover.png")
    ).rejects.toThrow("Username is required to upload a cover image.");
  });

  it("should delete previous cover if exists", async () => {
    mockFindCoverByUsername.mockResolvedValueOnce({ coverFileName: "old.png" });
    mockUpdateCover.mockResolvedValueOnce(undefined);

    const filename = await service.processCoverUpload("user1", "new.png");

    expect(FileManager.getCoverImagePath).toHaveBeenCalledWith(
      expect.any(String),
      "old.png"
    );
    expect(FileManager.delete).toHaveBeenCalledWith("/mockpath/old.png");
    expect(mockUpdateCover).toHaveBeenCalledWith(
      "user1",
      "new.png",
      "uploaded"
    );
    expect(filename).toBe("new.png");
  });

  it("should not call FileManager.delete if no previous cover", async () => {
    mockFindCoverByUsername.mockResolvedValueOnce(null);
    mockUpdateCover.mockResolvedValueOnce(undefined);

    const filename = await service.processCoverUpload("user2", "new.png");

    expect(FileManager.delete).not.toHaveBeenCalled();
    expect(mockUpdateCover).toHaveBeenCalledWith(
      "user2",
      "new.png",
      "uploaded"
    );
    expect(filename).toBe("new.png");
  });

  it("should not call FileManager.delete if coverInfo.coverFileName is falsy", async () => {
    mockFindCoverByUsername.mockResolvedValueOnce({ coverFileName: "" });
    mockUpdateCover.mockResolvedValueOnce(undefined);

    const filename = await service.processCoverUpload("user3", "file.png");

    expect(FileManager.delete).not.toHaveBeenCalled();
    expect(mockUpdateCover).toHaveBeenCalledWith(
      "user3",
      "file.png",
      "uploaded"
    );
    expect(filename).toBe("file.png");
  });

  it("should throw if coverRepository.updateCover throws", async () => {
    mockFindCoverByUsername.mockResolvedValueOnce(null);
    mockUpdateCover.mockRejectedValueOnce(new Error("Repo error"));

    await expect(
      service.processCoverUpload("user4", "cover.png")
    ).rejects.toThrow("Repo error");
  });
});
