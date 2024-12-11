import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const newsletterSchema = Schema({

},{timestamps: true});

export const Newsletter = models?.Newsletter || mongoose.model("Newsletter", newsletterSchema);