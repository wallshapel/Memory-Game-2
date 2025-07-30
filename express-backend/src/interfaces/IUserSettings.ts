export interface IUserSettings extends Document {
  name: string;
  difficulty: number;
  theme: number;
  totalCards: number;
  coverType: "default" | "uploaded";
  coverFileName?: string; // optional unless coverType is 'uploaded'
  controlMethod: "mouse" | "keyboard";
  background: number;
  musicVolume: number;
  musicMuted: boolean;
  effectsVolume: number;
  effectsMuted: boolean;
  createdAt: Date;
}

export interface ISaveUpdateUserSettings {
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
}

export interface IUserSettingsUpdate {
  difficulty?: number;
  theme?: number;
  totalCards?: number;
  coverType?: string;
  controlMethod?: string;
  background?: number;
  musicVolume?: number;
  musicMuted?: boolean;
  effectsVolume?: number;
  effectsMuted?: boolean;
  coverFileName?: string;
}