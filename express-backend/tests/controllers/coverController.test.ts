// tests/controllers/coverController.test.ts
import { uploadCover } from "../../src/controllers/coverController";
import { describe, it, expect, vi } from "vitest";

describe("uploadCover controller", () => {
  const mockCoverService = {
    processCoverUpload: vi.fn(),
  };

  const getMockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it("should respond with 400 if no file is uploaded", async () => {
    const req: any = { body: { username: "testuser" }, file: undefined };
    const res = getMockRes();

    await uploadCover(mockCoverService as any)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No file uploaded." });
  });

  it("should respond with 400 if no username is provided", async () => {
    const req: any = { body: { }, file: { filename: "file.png" } };
    const res = getMockRes();

    await uploadCover(mockCoverService as any)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Username is required." });
  });

  it("should call processCoverUpload and respond with filename", async () => {
    const req: any = { body: { username: "testuser" }, file: { filename: "file.png" } };
    const res = getMockRes();

    mockCoverService.processCoverUpload.mockResolvedValueOnce("file.png");

    await uploadCover(mockCoverService as any)(req, res);

    expect(mockCoverService.processCoverUpload).toHaveBeenCalledWith("testuser", "file.png");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ filename: "file.png" });
  });

  it("should handle service errors and respond with 500", async () => {
    const req: any = { body: { username: "testuser" }, file: { filename: "file.png" } };
    const res = getMockRes();

    mockCoverService.processCoverUpload.mockRejectedValueOnce(new Error("Something went wrong"));

    await uploadCover(mockCoverService as any)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Something went wrong" });
  });

  it("should handle unknown errors and respond with 500", async () => {
    const req: any = { body: { username: "testuser" }, file: { filename: "file.png" } };
    const res = getMockRes();

    mockCoverService.processCoverUpload.mockRejectedValueOnce("UnknownError");

    await uploadCover(mockCoverService as any)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Unknown server error" });
  });
});
