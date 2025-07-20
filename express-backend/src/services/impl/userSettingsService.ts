import UserSettings from "../../models/UserSettings";
import { IUserSettings } from "../../interfaces/IUserSettings";

/**
 * Saves or updates user settings.
 * If settings for the given name already exist, they will be updated.
 *
 * @param data - User settings data
 * @returns The saved user settings document
 */
export const saveOrUpdateUserSettings = async (data: {
  name: string;
  difficulty: number;
  theme: number;
  totalCards: number;
  coverType: "default" | "uploaded";
  coverFileName?: string;
  controlMethod: "mouse" | "keyboard";
  background: number;
}): Promise<IUserSettings> => {
  // Upsert (update if exists, otherwise insert)
  const update: any = {
    difficulty: data.difficulty,
    theme: data.theme,
    totalCards: data.totalCards,
    coverType: data.coverType,
    controlMethod: data.controlMethod,
    background: data.background,
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
};

/**
 * Retrieves user settings by user name.
 *
 * @param name - User name
 * @returns The user settings document, or null if not found
 */
export const getUserSettings = async (
  name: string
): Promise<IUserSettings | null> => {
  return await UserSettings.findOne({ name }).exec();
};
