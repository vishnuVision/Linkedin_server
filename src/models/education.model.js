import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const educationSchema = Schema({
    school:{
        type:String,
        required:true
    },
    degree: String,
    fieldOfStudy: String,
    startYear: Date,
    endYear: Date,
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
},{timestamps: true});

export const Education = models?.Education || mongoose.model("Education", educationSchema);

// type:Types.ObjectId,
//         ref:"Page",
//         required:true