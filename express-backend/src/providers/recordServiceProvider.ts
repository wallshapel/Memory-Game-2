// src/providers/recordServiceProvider.ts
import { RecordService } from "../services/recordService";
import { RecordServiceImp } from "../services/impl/recordServiceImp";
import { RecordRepositoryImp } from "../repositories/impl/RecordRepositoryImp";

export const recordServiceProvider = (): RecordService => {
  return new RecordServiceImp(new RecordRepositoryImp());
};
