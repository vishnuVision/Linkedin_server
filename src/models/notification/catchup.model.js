import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const catchupSchema = Schema({
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    type: {
        type: String,
        enum: ["birthday","education","job changes","work anniversaries"],
    },
    referenceId:{
        type: Schema.Types.ObjectId,
        ref: "Experience",
    },
    yearsOfExperience : Number
},{timestamps: true});

export const Catchup = models?.Catchup || mongoose.model("Catchup", catchupSchema);