import { ISaveUpdateUserSettings, IUserSettings } from "../interfaces/IUserSettings";

export interface UserSettingsService {
  saveOrUpdateUserSettings(data: ISaveUpdateUserSettings): Promise<IUserSettings>;
  getLatestUserSettings(): Promise<IUserSettings | null>;
  userExists(name: string): Promise<boolean>;
  getUserSettingsByName(name: string): Promise<IUserSettings | null>;
}
