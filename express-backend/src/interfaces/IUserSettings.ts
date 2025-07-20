export interface IUserSettings extends Document {
  name: string;
  difficulty: number;
  theme: number;
  totalCards: number;
  coverType: "default" | "uploaded";
  coverFileName?: string; // optional unless coverType is 'uploaded'
  controlMethod: "mouse" | "keyboard";
  background: number;
  createdAt: Date;
}
