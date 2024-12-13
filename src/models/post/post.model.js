import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const postSchema = Schema({
    text:String,
    media: [
        String
    ],
    viewPriority:{
        type:String,
        enum:["anyone","connection"],
        default:"anyone"
    },
    author:{
        type:Types.ObjectId,
        ref:"User",
        ref:"Page"
    },
    referenceId:{
        type:Types.ObjectId,
        ref:"Group",
        ref:"Event",
        ref:"Newsletter",
    }
},{timestamps: true});

export const Post = models?.Post || mongoose.model("Post", postSchema);