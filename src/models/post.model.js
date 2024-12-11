import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const postSchema = Schema({
    text:String,
    media: [
        {
            title: String,
            description: String,
            url: String
        }
    ],
    viewPriority:{
        type:String,
        enum:["anyone","connection"]
    },
    likes:[Types.ObjectId],
    author:{
        type:Types.ObjectId,
        ref:"User"
    }
},{timestamps: true});

export const Post = models?.Post || mongoose.model("Post", postSchema);