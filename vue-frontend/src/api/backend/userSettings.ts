// src/api/backend/userSettings.ts
import type { IGameRecord } from "../../interfaces/IGameRecord";
import type { IUserSettings } from "../../interfaces/IUserSettings";
import api from "./apiConfig";

/**
 * Fetches the latest user settings from the backend.
 *
 * @returns The most recently saved IUserSettings object.
 */
export const getLatestUserSettings = async () => {
  const { data } = await api.get<IUserSettings>("/user-settings/latest");
  return data;
};

/**
 * Saves the provided user settings to the backend.
 *
 * @param settings - The user settings to save.
 * @returns The saved IUserSettings object from the server.
 */
export const saveUserSettings = async (settings: IUserSettings) => {
  const { data } = await api.post<IUserSettings>("/user-settings", settings);
  return data;
};

/**
 * Checks if a user with the given name exists in the backend.
 *
 * @param name - The username to check.
 * @returns True if the user exists, otherwise false.
 */
export const checkUserExists = async (name: string) => {
  const { data } = await api.get<{ exists: boolean }>(
    `/user-settings/exists/${encodeURIComponent(name)}`
  );
  return data.exists;
};

/**
 * Fetches the user settings by username.
 *
 * @param name - The username to look up.
 * @returns The IUserSettings object for the user.
 */
export const getUserSettingsByName = async (name: string) => {
  const { data } = await api.get<IUserSettings>(
    `/user-settings/name/${encodeURIComponent(name)}`
  );
  return data;
};

/**
 * Retrieves a game record by username.
 *
 * @param name - The username whose record is requested.
 * @returns The IGameRecord for the user, or null if not found.
 */
export const getRecordByName = async (name: string) => {
  const { data } = await api.get<IGameRecord | null>(
    `/records/name/${encodeURIComponent(name)}`
  );
  return data;
};
