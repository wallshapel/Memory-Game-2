export interface IUserSettings {
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
  createdAt?: string;
}
