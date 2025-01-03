import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const educationSchema = Schema({
    school:{
        type: Schema.Types.Mixed,
        ref: "Page",
        required: true
    },
    degree: String,
    fieldOfStudy: String,
    startYear: {
        type: String,
    },
    startMonth: {
        type: String,
    },
    endYear: {
        type: String,
    },
    endMonth:{
        type: String,
    },
    grade: String,
    activities: String,
    description: String,
    media: [
        {
            title: String,
            description: String,
            url: String
        }
    ],
    isPresent:{
        type:Boolean,
        default:false,
        required:true
    },
    alumini:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps: true});

export const Education = models?.Education || mongoose.model("Education", educationSchema);

