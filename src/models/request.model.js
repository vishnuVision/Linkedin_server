import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const requestSchema = Schema({

},{timestamps: true});

export const Request = models?.Request || mongoose.model("Request", requestSchema);