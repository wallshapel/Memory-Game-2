// src/api/backend/userSettings.ts
import type { IGameRecord } from "../../interfaces/IGameRecord";
import type { IUserSettings } from "../../interfaces/IUserSettings";
import api from "./apiConfig";

export const getLatestUserSettings = async () => {
  const { data } = await api.get<IUserSettings>("/user-settings/latest");
  return data;
};

export const saveUserSettings = async (settings: IUserSettings) => {
  const { data } = await api.post<IUserSettings>("/user-settings", settings);
  return data;
};

export const checkUserExists = async (name: string) => {
  const { data } = await api.get<{ exists: boolean }>(
    `/user-settings/exists/${encodeURIComponent(name)}`
  );
  return data.exists;
};

export const getUserSettingsByName = async (name: string) => {
  const { data } = await api.get<IUserSettings>(
    `/user-settings/name/${encodeURIComponent(name)}`
  );
  return data;
};

export const getRecordByName = async (name: string) => {
  const { data } = await api.get<IGameRecord | null>(
    `/records/name/${encodeURIComponent(name)}`
  );
  return data;
};
