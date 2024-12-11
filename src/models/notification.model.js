import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const notificationSchema = Schema({

},{timestamps: true});

export const Notification = models?.Notification || mongoose.model("Notification", notificationSchema);