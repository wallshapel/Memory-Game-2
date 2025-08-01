// src/models/UserSettings.ts
import mongoose, { Schema } from "mongoose";
import { IUserSettings } from "../interfaces/IUserSettings";

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 18,
      match: /\S/, // not just spaces
    },
    difficulty: {
      type: Number,
      required: true,
    },
    theme: {
      type: Number,
      required: true,
    },
    totalCards: {
      type: Number,
      required: true,
    },
    coverType: {
      type: String,
      enum: ["default", "uploaded"],
      required: true,
    },
    coverFileName: {
      type: String,
      required: function () {
        return this.coverType === "uploaded";
      },
    },
    controlMethod: {
      type: String,
      enum: ["mouse", "keyboard"],
      required: true,
    },
    background: {
      type: Number,
      required: true,
    },
    musicVolume: {
      type: Number,
      default: 100,
      required: true,
    },
    musicMuted: {
      type: Boolean,
      default: false,
      required: true,
    },
    effectsVolume: {
      type: Number,
      default: 100,
      required: true,
    },
    effectsMuted: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model<IUserSettings>(
  "UserSettings",
  UserSettingsSchema
);
