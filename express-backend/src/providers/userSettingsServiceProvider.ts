// src/providers/userSettingsServiceProvider.ts
import { UserSettingsService } from "../services/userSettingsService";
import { UserSettingsServiceImp } from "../services/impl/userSettingsServiceImp";
import { UserSettingsRepositoryImp } from "../repositories/impl/UserSettingsRepositoryImp";

export const userSettingsServiceProvider = (): UserSettingsService => {
  return new UserSettingsServiceImp(new UserSettingsRepositoryImp());
};
