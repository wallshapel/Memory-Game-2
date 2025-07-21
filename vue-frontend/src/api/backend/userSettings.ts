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
