import api from "./apiConfig";
import type { IGameRecord } from "../../interfaces/IGameRecord";

export const getTopRecords = async () => {
  const { data } = await api.get<IGameRecord[]>("/records");
  return data;
};

export const trySaveRecord = async (record: Omit<IGameRecord, "effectiveness" | "createdAt">) => {
  const { data } = await api.post("/records", record);
  return data;
};

export const saveRecord = async (record: {
  name: string;
  difficulty: number;
  totalCards: number;
  hits: number;
  mistakes: number;
  time: number;
}) => {
  const { data } = await api.post("/records", record);
  return data;
};
