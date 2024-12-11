import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const pageSchema = Schema({

},{timestamps: true});

export const Page = models?.Page || mongoose.model("Page", pageSchema);