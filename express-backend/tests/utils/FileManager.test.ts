// tests/utils/FileManager.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileManager } from "../../src/utils/FileManager";
import * as fs from "fs";
import * as path from "path";

vi.mock("fs");
vi.mock("path");

describe("FileManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("exists", () => {
    it("should return true if file exists", () => {
      (fs.existsSync as any).mockReturnValue(true);
      expect(FileManager.exists("/tmp/file.png")).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith("/tmp/file.png");
    });

    it("should return false if file does not exist", () => {
      (fs.existsSync as any).mockReturnValue(false);
      expect(FileManager.exists("/tmp/file.png")).toBe(false);
      expect(fs.existsSync).toHaveBeenCalledWith("/tmp/file.png");
    });
  });

  describe("delete", () => {
    it("should call unlinkSync if file exists", () => {
      (fs.existsSync as any).mockReturnValue(true);
      FileManager.delete("/tmp/file.png");
      expect(fs.existsSync).toHaveBeenCalledWith("/tmp/file.png");
      expect(fs.unlinkSync).toHaveBeenCalledWith("/tmp/file.png");
    });

    it("should not call unlinkSync if file does not exist", () => {
      (fs.existsSync as any).mockReturnValue(false);
      FileManager.delete("/tmp/file.png");
      expect(fs.existsSync).toHaveBeenCalledWith("/tmp/file.png");
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe("getCoverImagePath", () => {
    it("should join paths correctly", () => {
      (path.join as any).mockReturnValue(
        "/some/root/public/uploads/images/covers/file.png"
      );
      const result = FileManager.getCoverImagePath("/some/root", "file.png");
      expect(path.join).toHaveBeenCalledWith(
        "/some/root",
        "public/uploads/images/covers",
        "file.png"
      );
      expect(result).toBe("/some/root/public/uploads/images/covers/file.png");
    });
  });
});
