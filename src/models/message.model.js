import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const messageSchema = Schema({

},{timestamps: true});

export const Message = models?.Message || mongoose.model("Message", messageSchema);