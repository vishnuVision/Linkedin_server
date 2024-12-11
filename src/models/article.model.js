import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const articleSchema = Schema({

},{timestamps: true});

export const Article = models?.Article || mongoose.model("Article", articleSchema);