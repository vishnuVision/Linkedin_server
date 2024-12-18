import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const savedJobSchema = Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    job:{
        type: Schema.Types.ObjectId,
        ref: "Job",
        required: true
    }
},{timestamps: true});

export const Savedjob = models?.Savedjob || mongoose.model("Savedjob", savedJobSchema);