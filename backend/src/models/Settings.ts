import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  logoUrl: string;
}

const settingsSchema = new Schema<ISettings>({
  logoUrl: {
    type: String,
    default: 'https://i.imgur.com/gOE1K3j.png'
  }
});

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
