// tests/services/recordServiceImp.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RecordServiceImp } from "../../src/services/impl/recordServiceImp";
import { IGameRecord, ISaveRecord } from "../../src/interfaces/IGameRecord";

// Mock compareRecords separately
vi.mock("../../src/utils/compareRecords", () => ({
  compareRecords: vi.fn(),
}));
import { compareRecords } from "../../src/utils/compareRecords";

// Mock repository
const getTopRecords = vi.fn();
const createRecord = vi.fn();
const deleteRecordById = vi.fn();
const getBestUserRecord = vi.fn();

const repositoryMock = {
  getTopRecords,
  createRecord,
  deleteRecordById,
  getBestUserRecord,
};

describe("RecordServiceImp", () => {
  let service: RecordServiceImp;

  beforeEach(() => {
    getTopRecords.mockReset();
    createRecord.mockReset();
    deleteRecordById.mockReset();
    getBestUserRecord.mockReset();
    (compareRecords as any).mockReset();
    service = new RecordServiceImp(repositoryMock as any);
  });

  it("should save the record if less than 20 records exist", async () => {
    getTopRecords.mockResolvedValueOnce([]);
    createRecord.mockResolvedValueOnce(undefined);

    const result = await service.saveRecord({
      name: "__test_user__",
      difficulty: 3,
      totalCards: 20,
      hits: 10,
      mistakes: 0,
      time: 99,
    });

    expect(result).toEqual({ saved: true });
    expect(createRecord).toHaveBeenCalledWith(
      expect.objectContaining({ name: "__test_user__", effectiveness: 100 })
    );
    expect(deleteRecordById).not.toHaveBeenCalled();
  });

  it("should not save the record if does not qualify for top 20", async () => {
    // 20 records, and compareRecords returns 1 (worse)
    const fakeRecord: any = {
      _id: "20",
      difficulty: 3,
      totalCards: 20,
      effectiveness: 95,
      time: 120,
    };
    getTopRecords.mockResolvedValueOnce(
      Array(19).fill(fakeRecord).concat([fakeRecord])
    );
    (compareRecords as any).mockReturnValue(1);

    const result = await service.saveRecord({
      name: "__test_user__",
      difficulty: 2,
      totalCards: 12,
      hits: 2,
      mistakes: 3,
      time: 200,
    });

    expect(result).toEqual({ saved: false, reason: "Not in top 20" });
    expect(createRecord).not.toHaveBeenCalled();
    expect(deleteRecordById).not.toHaveBeenCalled();
  });

  it("should replace worst record if qualifies and 20 exist", async () => {
    // 20 records, compareRecords returns -1 (better)
    const worstRecord: any = {
      _id: "bad_id",
      difficulty: 1,
      totalCards: 4,
      effectiveness: 10,
      time: 999,
    };
    const fakeTop = Array(19).fill({ ...worstRecord, _id: "x" });
    getTopRecords.mockResolvedValueOnce([...fakeTop, worstRecord]);
    (compareRecords as any).mockReturnValue(-1);
    createRecord.mockResolvedValueOnce(undefined);
    deleteRecordById.mockResolvedValueOnce(undefined);

    const result = await service.saveRecord({
      name: "__test_user__",
      difficulty: 3,
      totalCards: 24,
      hits: 22,
      mistakes: 2,
      time: 100,
    });

    expect(deleteRecordById).toHaveBeenCalledWith("bad_id");
    expect(createRecord).toHaveBeenCalled();
    expect(result).toEqual({ saved: true });
  });

  it("should calculate effectiveness correctly", async () => {
    getTopRecords.mockResolvedValueOnce([]);
    createRecord.mockResolvedValueOnce(undefined);

    await service.saveRecord({
      name: "__test_user__",
      difficulty: 2,
      totalCards: 10,
      hits: 4,
      mistakes: 1,
      time: 60,
    });

    // Effectiveness: 4 / (4+1) * 100 = 80
    expect(createRecord).toHaveBeenCalledWith(
      expect.objectContaining({ effectiveness: 80 })
    );
  });

  it("should handle 0 attempts (hits+mistakes)", async () => {
    getTopRecords.mockResolvedValueOnce([]);
    createRecord.mockResolvedValueOnce(undefined);

    await service.saveRecord({
      name: "__test_user__",
      difficulty: 2,
      totalCards: 10,
      hits: 0,
      mistakes: 0,
      time: 60,
    });

    expect(createRecord).toHaveBeenCalledWith(
      expect.objectContaining({ effectiveness: 0 })
    );
  });

  it("should propagate errors from repository", async () => {
    getTopRecords.mockRejectedValueOnce(new Error("DB error"));
    await expect(
      service.saveRecord({
        name: "__test_user__",
        difficulty: 1,
        totalCards: 2,
        hits: 1,
        mistakes: 0,
        time: 1,
      })
    ).rejects.toThrow("DB error");
  });

  it("should get top records", async () => {
    const mockTop = [{ name: "__test_user__" }];
    getTopRecords.mockResolvedValueOnce(mockTop);

    const result = await service.getTopRecords();

    expect(result).toBe(mockTop);
    expect(getTopRecords).toHaveBeenCalledWith(20);
  });

  it("should get best user record", async () => {
    const mockRecord = { name: "__test_user__" };
    getBestUserRecord.mockResolvedValueOnce(mockRecord);

    const result = await service.getBestUserRecord("__test_user__");

    expect(result).toBe(mockRecord);
    expect(getBestUserRecord).toHaveBeenCalledWith("__test_user__");
  });
});
