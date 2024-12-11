import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const eventSchema = Schema({

},{timestamps: true});

export const Event = models?.Event || mongoose.model("Event", eventSchema);