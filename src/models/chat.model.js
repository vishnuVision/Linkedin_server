import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const chatSchema = Schema({

},{timestamps: true});

export const Chat = models?.Chat || mongoose.model("Chat", chatSchema);