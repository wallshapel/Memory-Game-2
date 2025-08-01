// src/providers/coverServiceProvider.ts
import { CoverService } from "../services/coverService";
import { CoverServiceImp } from "../services/impl/coverServiceImp";
import { CoverRepositoryImp } from "../repositories/impl/CoverRepositoryImp";

export const coverServiceProvider = (): CoverService => {
  // If you ever want to swap implementations, do it here.
  return new CoverServiceImp(new CoverRepositoryImp());
};
