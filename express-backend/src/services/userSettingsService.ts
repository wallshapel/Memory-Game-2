import { IUserSettings } from "../interfaces/IUserSettings";

export interface UserSettingsService {
  saveOrUpdateUserSettings(data: {
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
  }): Promise<IUserSettings>;

  getLatestUserSettings(): Promise<IUserSettings | null>;
}
