// tests/unit/api/backend/records.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTopRecords,
  saveRecord,
  getBestRecordForUser,
} from "../../../../src/api/backend/records";

vi.mock("../../../../src/api/backend/apiConfig", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
import api from "../../../../src/api/backend/apiConfig";

const mockedGet = api.get as unknown as ReturnType<typeof vi.fn>;
const mockedPost = api.post as unknown as ReturnType<typeof vi.fn>;

describe("getTopRecords", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the records array from the backend", async () => {
    const recordsFake = [
      { id: "1", name: "User1", score: 10, time: 60 },
      { id: "2", name: "User2", score: 15, time: 50 },
    ];
    mockedGet.mockResolvedValueOnce({ data: recordsFake });

    const result = await getTopRecords();
    expect(mockedGet).toHaveBeenCalledWith("/records");
    expect(result).toEqual(recordsFake);
  });

  it("propagates API errors", async () => {
    mockedGet.mockRejectedValueOnce(new Error("fail"));
    await expect(getTopRecords()).rejects.toThrow("fail");
  });
});

describe("saveRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the record via POST and returns the response", async () => {
    const recordFake = { name: "user", score: 99, time: 44 };
    mockedPost.mockResolvedValueOnce({ data: { saved: true } });

    const result = await saveRecord(recordFake as any);
    expect(mockedPost).toHaveBeenCalledWith("/records", recordFake);
    expect(result).toEqual({ saved: true });
  });

  it("propagates API errors", async () => {
    mockedPost.mockRejectedValueOnce(new Error("fail"));
    await expect(saveRecord({} as any)).rejects.toThrow("fail");
  });

  it("returns the best record for a user", async () => {
    const bestRecord = { id: "5", name: "abel", score: 88, time: 40 };
    mockedGet.mockResolvedValueOnce({ data: bestRecord });

    const result = await getBestRecordForUser("abel");
    expect(mockedGet).toHaveBeenCalledWith("/records/best/abel");
    expect(result).toEqual(bestRecord);
  });

  it("propagates API errors", async () => {
    mockedGet.mockRejectedValueOnce(new Error("fail"));
    await expect(getBestRecordForUser("abel")).rejects.toThrow("fail");
  });
});
