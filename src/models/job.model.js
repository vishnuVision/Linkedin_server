import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const jobSchema = Schema({

},{timestamps: true});

export const Job = models?.Job || mongoose.model("Job", jobSchema);