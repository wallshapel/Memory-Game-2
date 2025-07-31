import { uploadCover } from "../../src/controllers/coverController";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Simple mocks for req and res
const getMockReqRes = (overrides = {}) => {
  const req: any = {
    body: {},
    file: undefined,
    ...overrides,
  };

  let statusCode = 0;
  let jsonPayload: any = null;

  const res: any = {
    status: vi.fn((code) => {
      statusCode = code;
      return res;
    }),
    json: vi.fn((payload) => {
      jsonPayload = payload;
      return res;
    }),
    // In case you want to check the result
    _getStatus: () => statusCode,
    _getJson: () => jsonPayload,
  };

  return { req, res };
};

// Patch: Hack processCoverUpload method during unit testing
const mockCoverService = {
  processCoverUpload: vi.fn(),
};

vi.mock("../../src/services/impl/coverServiceImp", () => {
  return {
    CoverServiceImp: class {
      async processCoverUpload(username: string, filename: string) {
        // Call the mock
        return mockCoverService.processCoverUpload(username, filename);
      }
    }
  }
});

describe("uploadCover (controller) - unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if no file is uploaded", async () => {
    const { req, res } = getMockReqRes({ body: { username: "test" }, file: undefined });
    await uploadCover(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "No file uploaded." });
  });

  it("should return 400 if no username is provided", async () => {
    const { req, res } = getMockReqRes({ file: { filename: "file.png" }, body: {} });
    await uploadCover(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Username is required." });
  });

  it("should return 201 and filename on success", async () => {
    // Configure the mock to simulate success
    mockCoverService.processCoverUpload.mockResolvedValueOnce("cover123.png");
    const { req, res } = getMockReqRes({ file: { filename: "file.png" }, body: { username: "test" } });
    await uploadCover(req, res);

    expect(mockCoverService.processCoverUpload).toHaveBeenCalledWith("test", "file.png");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ filename: "cover123.png" });
  });

  it("should handle errors thrown by the service", async () => {
    mockCoverService.processCoverUpload.mockRejectedValueOnce(new Error("Service error"));
    const { req, res } = getMockReqRes({ file: { filename: "file.png" }, body: { username: "test" } });
    await uploadCover(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Service error" });
  });
});
