import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const likeSchema = Schema({
    owner:{
        type:Types.ObjectId,
        ref:"User",
        // ref:"Page"
    },
    post:{
        type:Types.ObjectId,
        ref:"Post",
        ref:"Article",
        ref:"Comment"
    }
},{timestamps: true});

export const Like = models?.Like || mongoose.model("Like", likeSchema);