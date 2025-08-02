// src/api/backend/records.ts
import api from "./apiConfig";
import type { IGameRecord, ISaveRecord } from "../../interfaces/IGameRecord";

/**
 * Fetches the top game records from the backend.
 *
 * @returns An array of IGameRecord objects.
 */
export const getTopRecords = async () => {
  const { data } = await api.get<IGameRecord[]>("/records");
  return data;
};

/**
 * Saves a new game record to the backend.
 *
 * @param record - The record data to save.
 * @returns The server response.
 */
export const saveRecord = async (record: ISaveRecord) => {
  const { data } = await api.post("/records", record);
  return data;
};

/**
 * Retrieves the best record for a specific user.
 *
 * @param name - The username to fetch the best record for.
 * @returns The best IGameRecord for the user.
 */
export const getBestRecordForUser = async (name: string) => {
  const { data } = await api.get(`/records/best/${name}`);
  return data;
};
