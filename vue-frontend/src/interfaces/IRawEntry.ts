// src/interfaces/IRawEntry.ts
export interface IApiResponse {
  entries: IRawEntry[];
}

export interface IRawEntry {
  meta?: {
    name?: string;
  };
  fields?: {
    image?: {
      url?: string;
    };
  };
}
