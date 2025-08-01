// src/repositories/impl/UserSettingsRepositoryImp.ts
import UserSettings from "../../models/UserSettings";
import {
  IUserSettings,
  ISaveUpdateUserSettings,
  IUserSettingsUpdate,
} from "../../interfaces/IUserSettings";
import { UserSettingsRepository } from "../UserSettingsRepository";

export class UserSettingsRepositoryImp implements UserSettingsRepository {
  async saveOrUpdateUserSettings(
    data: ISaveUpdateUserSettings
  ): Promise<IUserSettings> {
    const update: IUserSettingsUpdate = {
      difficulty: data.difficulty,
      theme: data.theme,
      totalCards: data.totalCards,
      coverType: data.coverType,
      controlMethod: data.controlMethod,
      background: data.background,
      musicVolume: data.musicVolume,
      musicMuted: data.musicMuted,
      effectsVolume: data.effectsVolume,
      effectsMuted: data.effectsMuted,
    };

    if (data.coverType === "uploaded")
      update.coverFileName = data.coverFileName;
    else update.coverFileName = undefined;

    const settings = await UserSettings.findOneAndUpdate(
      { name: data.name },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    return settings as IUserSettings;
  }

  async getLatestUserSettings(): Promise<IUserSettings | null> {
    return UserSettings.findOne({}).sort({ createdAt: -1 });
  }

  async userExists(name: string): Promise<boolean> {
    const result = await UserSettings.exists({ name });
    return result !== null;
  }

  async getUserSettingsByName(name: string): Promise<IUserSettings | null> {
    return UserSettings.findOne({ name });
  }
}
