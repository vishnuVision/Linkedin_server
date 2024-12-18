import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const catchupSchema = Schema({
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
        ref: "Page",
    },
    type: {
        type: String,
        enum: ["birthday","education","experience","work-anniversaries"],
    },
    referenceId:{
        type: Schema.Types.ObjectId,
        ref: "Experience",
    }
},{timestamps: true});

export const Catchup = models?.Catchup || mongoose.model("Catchup", catchupSchema);