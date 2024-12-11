import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const commentSchema = Schema({
    postId:{
        type:Types.ObjectId,
        ref:"Post"
    },
    text:String,
    media: [
        {
            title: String,
            description: String,
            url: String
        }
    ],
    likes:[Types.ObjectId],
    owner:{
        types:Types.ObjectId,
        ref:"User"
    },
},{timestamps: true});

export const Comment = models?.Comment || mongoose.model("Comment", commentSchema);