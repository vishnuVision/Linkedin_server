import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const catchupSchema = Schema({

},{timestamps: true});

export const Catchup = models?.Catchup || mongoose.model("Catchup", catchupSchema);