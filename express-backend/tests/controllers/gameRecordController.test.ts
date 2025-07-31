import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks and helpers must be defined BEFORE importing controller
const mockTrySaveRecord = vi.fn();

vi.doMock("../../src/services/impl/gameRecordServiceImp", () => {
  return {
    GameRecordServiceImpl: vi.fn().mockImplementation(() => ({
      trySaveRecord: mockTrySaveRecord,
    })),
  };
});

// Keep GameRecord for getTopRecords mocking
import GameRecord from "../../src/models/GameRecord";

// Helper for mock res
function mockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("gameRecordController", () => {
  // Import the controller only AFTER the service mock is set up
  let saveRecord: any, getTopRecords: any;
  beforeEach(async () => {
    vi.clearAllMocks();
    // Import fresh module each test
    const controller = await import(
      "../../src/controllers/gameRecordController"
    );
    saveRecord = controller.saveRecord;
    getTopRecords = controller.getTopRecords;
  });

  describe("saveRecord", () => {
    it("should keep a valid record and respond 201", async () => {
      mockTrySaveRecord.mockResolvedValue(true);

      const req: any = {
        body: {
          name: "__test_user__",
          difficulty: 1,
          totalCards: 10,
          hits: 8,
          mistakes: 2,
          time: 10000,
        },
      };
      const res = mockResponse();

      await saveRecord(req, res);

      expect(mockTrySaveRecord).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ saved: true });
    });

    it("should answer 200 if not in the top 20", async () => {
      mockTrySaveRecord.mockResolvedValue(false);

      const req: any = {
        body: {
          name: "__test_user__",
          difficulty: 1,
          totalCards: 10,
          hits: 8,
          mistakes: 2,
          time: 10000,
        },
      };
      const res = mockResponse();

      await saveRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        saved: false,
        reason: "Not in top 20",
      });
    });

    it("should respond 400 if the service throws error", async () => {
      mockTrySaveRecord.mockRejectedValue(new Error("Service error"));

      const req: any = {
        body: {
          name: "__test_user__",
          difficulty: 1,
          totalCards: 10,
          hits: 8,
          mistakes: 2,
          time: 10000,
        },
      };
      const res = mockResponse();

      await saveRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Service error" });
    });
  });

  describe("getTopRecords", () => {
    it("should return the top 20 correctly", async () => {
      // Mock of model GameRecord.find().sort().limit().exec()
      const mockRecords = [{ name: "A" }, { name: "B" }];
      const execMock = vi.fn().mockResolvedValue(mockRecords);
      const limitMock = vi.fn().mockReturnValue({ exec: execMock });
      const sortMock = vi.fn().mockReturnValue({ limit: limitMock });
      vi.spyOn(GameRecord, "find").mockReturnValue({ sort: sortMock } as any);

      const req: any = {};
      const res = mockResponse();

      await getTopRecords(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRecords);
    });

    it("should respond 400 if the query fails", async () => {
      const sortMock = vi.fn().mockReturnValue({
        limit: vi
          .fn()
          .mockReturnValue({
            exec: vi.fn().mockRejectedValue(new Error("DB error")),
          }),
      });
      vi.spyOn(GameRecord, "find").mockReturnValue({ sort: sortMock } as any);

      const req: any = {};
      const res = mockResponse();

      await getTopRecords(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });
  });
});
