import UserSettings from "../../models/UserSettings";
import { IUserSettings } from "../../interfaces/IUserSettings";
import { UserSettingsService } from "../userSettingsService";

export class UserSettingsServiceImpl implements UserSettingsService {
  async saveOrUpdateUserSettings(data: {
    name: string;
    difficulty: number;
    theme: number;
    totalCards: number;
    coverType: "default" | "uploaded";
    coverFileName?: string;
    controlMethod: "mouse" | "keyboard";
    background: number;
    musicVolume: number;
    musicMuted: boolean;
    effectsVolume: number;
    effectsMuted: boolean;
  }): Promise<IUserSettings> {
    // Upsert (update if exists, otherwise insert)
    const update: any = {
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

    if (data.coverType === "uploaded") update.coverFileName = data.coverFileName;
    else update.coverFileName = undefined;

    // Find by name (unique for user), upsert
    const settings = await UserSettings.findOneAndUpdate(
      { name: data.name },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();

    return settings as IUserSettings;
  }

  async getLatestUserSettings(): Promise<IUserSettings | null> {
    return UserSettings
      .findOne({})
      .sort({ createdAt: -1 });
  }
}
