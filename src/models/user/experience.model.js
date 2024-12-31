import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const experienceSchema = Schema({
    company:{
        type: Schema.Types.ObjectId,
        ref: "Page",
        required: true
    },
    title: String,
    startMonth: String,
    endMonth: String,
    startYear: String,
    endYear: String,
    description: String,
    media: [
        {
            title: String,
            description: String,
            url: String
        }
    ],
    employmentType: {
        type:String,
        enum:["Full-time","Part-time","Self-employed","Internship","Freelance","Trainee"],
        default:"Full-time"
    },
    location:String,
    locationType:{
        type:String,
        enum:["On-site","Hybrid","Remote"],
        default:"On-site"
    },
    isPresent:{
        type:Boolean,
        default:false,
        required:true
    },
    employee:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps: true});

export const Experience = models?.Experience || mongoose.model("Experience", experienceSchema);