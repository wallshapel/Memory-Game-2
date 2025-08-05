// tests/unit/api/backend/cover.spec.ts
import { vi, describe, it, expect, beforeEach } from "vitest";
import { uploadCover } from "../../../../src/api/backend/cover";

// Mock apiConfig
vi.mock("../../../../src/api/backend/apiConfig", () => ({
  default: {
    post: vi.fn(),
  },
}));
import api from "../../../../src/api/backend/apiConfig";

// 👇 Cast the method to have access to mock helpers (mockResolvedValueOnce, etc.)
const mockedPost = api.post as unknown as ReturnType<typeof vi.fn>;

describe("uploadCover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("performs a POST to /covers with FormData and returns filename", async () => {
    mockedPost.mockResolvedValueOnce({ data: { filename: "img123.jpg" } });

    const fakeFile = new File(["(⌐□_□)"], "test.png", { type: "image/png" });
    const username = "test";

    const result = await uploadCover(fakeFile, username);

    expect(mockedPost).toHaveBeenCalledTimes(1);
    const [url, formData, options] = mockedPost.mock.calls[0];
    expect(url).toBe("/covers");
    expect(formData).toBeInstanceOf(FormData);
    expect(options).toMatchObject({
      headers: { "Content-Type": "multipart/form-data" },
    });

    expect(result).toEqual({ filename: "img123.jpg" });
  });

  it("propagates API errors", async () => {
    mockedPost.mockRejectedValueOnce(new Error("fail"));
    const fakeFile = new File(["(⌐□_□)"], "test.png", { type: "image/png" });
    await expect(uploadCover(fakeFile, "test")).rejects.toThrow("fail");
  });
});
