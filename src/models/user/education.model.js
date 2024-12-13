import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const educationSchema = Schema({
    school:{
        type:Schema.Types.ObjectId,
        ref: "Page",
        required: true
    },
    degree: String,
    fieldOfStudy: String,
    startYear: {
        type: Date,
        required: true
    },
    endYear: {
        type: Date,
        required: true
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
    }
},{timestamps: true});

export const Education = models?.Education || mongoose.model("Education", educationSchema);

