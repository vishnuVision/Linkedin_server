import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const groupSchema = Schema({

},{timestamps: true});

export const Group = models?.Group || mongoose.model("Group", groupSchema);