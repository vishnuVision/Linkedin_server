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
        enum: ["birthday","education","job","work-anniversaries"],
    },
    referenceId:{
        type: Schema.Types.ObjectId,
        ref: "Education",
        ref: "Job",
        ref: "Experience",
    }
},{timestamps: true});

export const Catchup = models?.Catchup || mongoose.model("Catchup", catchupSchema);