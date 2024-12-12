import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const experienceSchema = Schema({
    company:{
        type:String,
        required:true
    },
    title: String,
    startYear: Date,
    endYear: Date,
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
        default:true,
        required:true
    }
},{timestamps: true});

export const Experience = models?.Experience || mongoose.model("Experience", experienceSchema);

// type:Types.ObjectId,
//         ref:"Page",
//         required:true