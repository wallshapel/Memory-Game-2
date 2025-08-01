// src/services/impl/userSettingsServiceImp.ts
import {
  ISaveUpdateUserSettings,
  IUserSettings,
} from "../../interfaces/IUserSettings";
import { UserSettingsService } from "../userSettingsService";
import { UserSettingsRepository } from "../../repositories/UserSettingsRepository";

export class UserSettingsServiceImp implements UserSettingsService {
  private repository: UserSettingsRepository;

  constructor(repository: UserSettingsRepository) {
    this.repository = repository;
  }

  async saveOrUpdateUserSettings(
    data: ISaveUpdateUserSettings
  ): Promise<IUserSettings> {
    return this.repository.saveOrUpdateUserSettings(data);
  }

  async getLatestUserSettings(): Promise<IUserSettings | null> {
    return this.repository.getLatestUserSettings();
  }

  async userExists(name: string): Promise<boolean> {
    return this.repository.userExists(name);
  }

  async getUserSettingsByName(name: string): Promise<IUserSettings | null> {
    return this.repository.getUserSettingsByName(name);
  }
}
