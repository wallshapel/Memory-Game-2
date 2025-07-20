import { IUserSettings } from "../interfaces/IUserSettings"; 

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
  // TODO: Save or update the user settings document
  return {} as IUserSettings;
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
  // TODO: Retrieve the user settings document
  return null;
};
