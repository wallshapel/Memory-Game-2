// src/repositories/UserSettingsRepository.ts
import {
  IUserSettings,
  ISaveUpdateUserSettings,
} from "../interfaces/IUserSettings";

export interface UserSettingsRepository {
  saveOrUpdateUserSettings(
    data: ISaveUpdateUserSettings
  ): Promise<IUserSettings>;
  getLatestUserSettings(): Promise<IUserSettings | null>;
  userExists(name: string): Promise<boolean>;
  getUserSettingsByName(name: string): Promise<IUserSettings | null>;
}
