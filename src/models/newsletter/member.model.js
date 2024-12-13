import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const memberSchema = Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type:{
        type: String,
        enum: ["group","event","newsletter"],
        required: true
    },
    referenceId:{
        type: Schema.Types.ObjectId,
        ref: "Group",
        ref: "Event",
        ref: "Newsletter",
        required: true
    }
},{timestamps: true});

export const Member = models?.Member || mongoose.model("Member", memberSchema);