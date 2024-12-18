import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const applicantSchema = Schema({
    applicant:{
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

export const Applicant = models?.Applicant || mongoose.model("Applicant", applicantSchema);