// tests/controllers/recordController.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock service methods before importing the controller
const mockGetTopRecords = vi.fn();
const mockSave = vi.fn();
const mockGetBestUserRecord = vi.fn();

vi.doMock("../../src/services/impl/recordServiceImp", () => {
  return {
    RecordServiceImp: vi.fn().mockImplementation(() => ({
      getTopRecords: mockGetTopRecords,
      save: mockSave,
      getBestUserRecord: mockGetBestUserRecord,
    })),
  };
});

// Helper to mock res object
function mockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("recordController", () => {
  let getTopRecords: any, saveRecord: any, getBestUserRecord: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const controller = await import("../../src/controllers/recordController");
    getTopRecords = controller.getTopRecords;
    saveRecord = controller.saveRecord;
    getBestUserRecord = controller.getBestUserRecord;
  });

  describe("getTopRecords", () => {
    it("responds with records from the service", async () => {
      const mockRecords = [
        {
          name: "A",
          difficulty: 1,
          totalCards: 10,
          hits: 8,
          mistakes: 2,
          effectiveness: 80,
          time: 12345,
          createdAt: new Date(),
        },
      ];
      mockGetTopRecords.mockResolvedValue(mockRecords);

      const req: any = {};
      const res = mockResponse();

      await getTopRecords(req, res);

      expect(mockGetTopRecords).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockRecords);
    });

    it("responds 500 on error", async () => {
      mockGetTopRecords.mockRejectedValue(new Error("fail"));
      const req: any = {};
      const res = mockResponse();

      await getTopRecords(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch records",
      });
    });
  });

  describe("saveRecord", () => {
    it("responds 201 with the saved record", async () => {
      const body = {
        name: "Test",
        difficulty: 1,
        totalCards: 12,
        hits: 10,
        mistakes: 2,
        time: 12000,
      };
      const saved = {
        ...body,
        effectiveness: 83.3,
        createdAt: new Date(),
      };
      mockSave.mockResolvedValue(saved);

      const req: any = { body };
      const res = mockResponse();

      await saveRecord(req, res);

      expect(mockSave).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(saved);
    });

    it("responds 500 on error", async () => {
      mockSave.mockRejectedValue(new Error("DB error"));
      const req: any = { body: {} };
      const res = mockResponse();

      await saveRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Failed to save record" });
    });
  });

  describe("getBestUserRecord", () => {
    it("responds with the user's record if found", async () => {
      const record = {
        name: "Mario",
        difficulty: 2,
        totalCards: 20,
        hits: 18,
        mistakes: 2,
        effectiveness: 90,
        time: 15000,
        createdAt: new Date(),
      };
      mockGetBestUserRecord.mockResolvedValue(record);

      const req: any = { params: { name: "Mario" } };
      const res = mockResponse();

      await getBestUserRecord(req, res);

      expect(mockGetBestUserRecord).toHaveBeenCalledWith("Mario");
      expect(res.json).toHaveBeenCalledWith(record);
    });

    it("responds 400 if name is empty", async () => {
      const req: any = { params: { name: "" } };
      const res = mockResponse();

      await getBestUserRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid user name" });
      expect(mockGetBestUserRecord).not.toHaveBeenCalled();
    });

    it("responds 404 if no record is found", async () => {
      mockGetBestUserRecord.mockResolvedValue(null);

      const req: any = { params: { name: "Nobody" } };
      const res = mockResponse();

      await getBestUserRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No record found" });
    });

    it("responds 500 on error", async () => {
      mockGetBestUserRecord.mockRejectedValue(new Error("DB error"));

      const req: any = { params: { name: "Mario" } };
      const res = mockResponse();

      await getBestUserRecord(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to get user record",
      });
    });
  });
});
