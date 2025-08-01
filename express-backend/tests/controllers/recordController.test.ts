// tests/controllers/recordController.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveRecord,
  getTopRecords,
  getBestUserRecord,
} from "../../src/controllers/recordController";

// Helper to mock Express response object
const getMockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("recordController", () => {
  let recordServiceMock: any;

  beforeEach(() => {
    recordServiceMock = {
      saveRecord: vi.fn(),
      getTopRecords: vi.fn(),
      getBestUserRecord: vi.fn(),
    };
  });

  it("should save a record and return 201", async () => {
    recordServiceMock.saveRecord.mockResolvedValueOnce({ saved: true });
    const req: any = { body: { name: "__test_user__" } };
    const res = getMockRes();

    await saveRecord(recordServiceMock)(req, res);

    expect(recordServiceMock.saveRecord).toHaveBeenCalledWith({
      name: "__test_user__",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ saved: true });
  });

  it("should return 200 if record not saved with reason", async () => {
    recordServiceMock.saveRecord.mockResolvedValueOnce({
      saved: false,
      reason: "Not in top 20",
    });
    const req: any = { body: { name: "__test_user__" } };
    const res = getMockRes();

    await saveRecord(recordServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      saved: false,
      reason: "Not in top 20",
    });
  });

  it("should return 400 on service error", async () => {
    recordServiceMock.saveRecord.mockRejectedValueOnce(
      new Error("Error saving record")
    );
    const req: any = { body: { name: "__test_user__" } };
    const res = getMockRes();

    await saveRecord(recordServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Error saving record" });
  });

  it("should get top records", async () => {
    const records = [{ name: "__test_user__" }];
    recordServiceMock.getTopRecords.mockResolvedValueOnce(records);
    const req: any = {};
    const res = getMockRes();

    await getTopRecords(recordServiceMock)(req, res);

    expect(res.json).toHaveBeenCalledWith(records);
  });

  it("should handle error when getting top records", async () => {
    recordServiceMock.getTopRecords.mockRejectedValueOnce(new Error("Error!"));
    const req: any = {};
    const res = getMockRes();

    await getTopRecords(recordServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Error!" });
  });

  it("should get best user record", async () => {
    const record = { name: "__test_user__" };
    recordServiceMock.getBestUserRecord.mockResolvedValueOnce(record);
    const req: any = { params: { name: "__test_user__" } };
    const res = getMockRes();

    await getBestUserRecord(recordServiceMock)(req, res);

    expect(recordServiceMock.getBestUserRecord).toHaveBeenCalledWith(
      "__test_user__"
    );
    expect(res.json).toHaveBeenCalledWith(record);
  });

  it("should return 400 for invalid user name", async () => {
    const req: any = { params: { name: " " } };
    const res = getMockRes();

    await getBestUserRecord(recordServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid user name" });
  });

  it("should return 404 if no record found", async () => {
    recordServiceMock.getBestUserRecord.mockResolvedValueOnce(null);
    const req: any = { params: { name: "__test_user__" } };
    const res = getMockRes();

    await getBestUserRecord(recordServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No record found" });
  });

  it("should handle errors when getting best user record", async () => {
    recordServiceMock.getBestUserRecord.mockRejectedValueOnce(
      new Error("Failed to get user record")
    );
    const req: any = { params: { name: "__test_user__" } };
    const res = getMockRes();

    await getBestUserRecord(recordServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to get user record",
    });
  });
});
