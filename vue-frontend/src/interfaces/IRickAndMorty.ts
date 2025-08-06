// src/interfaces/IRickAndMorty.ts
export interface RickAndMortyCharacter {
  id: number;
  name: string;
  image: string;
}

export interface RickAndMortyApiResponse {
  results: RickAndMortyCharacter[];
}
