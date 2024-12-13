import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const jobSchema = Schema({
    title:{
        type: String,
        required: true
    },
    company:{
        type: Schema.Types.ObjectId,
        ref: "Page",
        required: true
    },
    location: {
        type: String,
        required: true
    },
    workplaceType: {
        type: String,
        enum: ["Remote","Hybrid","On-site"],
        required: true
    },
    jobType:{
        type: String,
        enum: ["Full-time","Part-time","Internship","Temporary","Contract"],
        required: true
    },
    about:{
        type: String,
    },
    skill:[String],
    answers:[{
        question: String,
        answer: String,
        idealAnswer: String,
    }]
},{timestamps: true});

export const Job = models?.Job || mongoose.model("Job", jobSchema);