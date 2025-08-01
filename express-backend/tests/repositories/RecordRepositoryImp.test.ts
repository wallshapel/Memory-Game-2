// tests/repositories/RecordRepositoryImp.test.ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { RecordRepositoryImp } from "../../src/repositories/impl/RecordRepositoryImp";
import GameRecord from "../../src/models/GameRecord";

describe("RecordRepositoryImp", () => {
  let mongoServer: MongoMemoryServer;
  let repository: RecordRepositoryImp;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    repository = new RecordRepositoryImp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await GameRecord.deleteMany({});
  });

  it("should create a new record", async () => {
    const data = {
      name: "__test_user__",
      difficulty: 2,
      totalCards: 20,
      hits: 10,
      mistakes: 1,
      effectiveness: 90,
      time: 70,
    };
    const created = await repository.createRecord(data);
    expect(created.name).toBe("__test_user__");
    expect(created.difficulty).toBe(2);
    expect(created.effectiveness).toBe(90);
  });

  it("should get top records with correct sort and limit", async () => {
    // Create three records with different fields for sort
    await GameRecord.create([
      {
        name: "userA",
        difficulty: 1,
        totalCards: 12,
        hits: 5,
        mistakes: 1,
        effectiveness: 83.3,
        time: 100,
      },
      {
        name: "userB",
        difficulty: 2,
        totalCards: 12,
        hits: 6,
        mistakes: 2,
        effectiveness: 75,
        time: 90,
      },
      {
        name: "userC",
        difficulty: 3,
        totalCards: 16,
        hits: 15,
        mistakes: 0,
        effectiveness: 100,
        time: 85,
      },
    ]);
    const records = await repository.getTopRecords(2);
    // userC should be first (highest difficulty), then userB
    expect(records).toHaveLength(2);
    expect(records[0].name).toBe("userC");
    expect(records[1].name).toBe("userB");
  });

  it("should get best user record with correct sort", async () => {
    // Same name, different totalCards and time
    await GameRecord.create([
      {
        name: "champ",
        difficulty: 2,
        totalCards: 20,
        hits: 17,
        mistakes: 2,
        effectiveness: 89.47,
        time: 100,
      },
      {
        name: "champ",
        difficulty: 3,
        totalCards: 24,
        hits: 21,
        mistakes: 2,
        effectiveness: 91.3,
        time: 80,
      },
      {
        name: "champ",
        difficulty: 3,
        totalCards: 12,
        hits: 10,
        mistakes: 1,
        effectiveness: 90.9,
        time: 99,
      },
    ]);
    const best = await repository.getBestUserRecord("champ");
    expect(best?.totalCards).toBe(24); // max totalCards
    expect(best?.time).toBe(80); // min time among those with max totalCards
  });

  it("should delete record by id", async () => {
    const created = await GameRecord.create({
      name: "todelete",
      difficulty: 1,
      totalCards: 10,
      hits: 5,
      mistakes: 2,
      effectiveness: 71.4,
      time: 110,
    });
    await repository.deleteRecordById(created._id.toString());
    const found = await GameRecord.findById(created._id);
    expect(found).toBeNull();
  });
});
