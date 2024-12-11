import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const experienceSchema = Schema({
    companyId:{
        type:Types.ObjectId,
        ref:"Page",
    },
    title: String,
    startDate: Date,
    endDate: Date,
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
        required:false
    }
},{timestamps: true});

export const Experience = models?.Experience || mongoose.model("Experience", experienceSchema);