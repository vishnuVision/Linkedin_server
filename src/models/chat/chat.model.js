import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const chatSchema = Schema({
    creator:{
        type:mongoose.Types.ObjectId,
        ref:"User",
    },
    members:[
        {
            type:mongoose.Types.ObjectId,
            ref:"User",
        }
    ]
},{timestamps: true});

export const Chat = models?.Chat || mongoose.model("Chat", chatSchema);