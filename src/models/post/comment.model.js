import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const commentSchema = Schema({
    referenceId:{
        type:Types.ObjectId,
        ref:"Post",
        // ref:"Article",
    },
    text:String,
    media:String,
    owner:{
        type:Types.ObjectId,
        ref:"User"
    },
    isSubComment:{
        type:Boolean,
        default:false
    },
    parentComment:{
        type:Types.ObjectId,
        ref:"Comment"
    },
    subComments:[
        {
            type:Types.ObjectId,
            ref:"Comment"
        }
    ]
},{timestamps: true});

export const Comment = models?.Comment || mongoose.model("Comment", commentSchema);