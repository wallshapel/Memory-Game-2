// src/api/backend/records.ts
import api from "./apiConfig";
import type { IGameRecord, ISaveRecord } from "../../interfaces/IGameRecord";

export const getTopRecords = async () => {
  const { data } = await api.get<IGameRecord[]>("/records");
  return data;
};

export const saveRecord = async (record: ISaveRecord) => {
  const { data } = await api.post("/records", record);
  return data;
};

export const getBestRecordForUser = async (name: string) => {
  const { data } = await api.get(`/records/best/${name}`);
  return data;
};
