import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const newsletterSchema = Schema({
    title:{
        type:String,
        required:true
    },
    publishRoutine:{
        type: String,
        enum: ["Daily","Weekly","Monthly"],
        required: true
    },
    description:{
        type:String,
        required:true
    },
    avatar: {
        type: String,
        required: true
    }, 
    author:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps: true});

export const Newsletter = models?.Newsletter || mongoose.model("Newsletter", newsletterSchema);