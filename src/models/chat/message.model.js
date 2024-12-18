import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const messageSchema = Schema({
    content:String,
    attachments:[
        {
            type:String,
            required:true
        }
    ],
    sender:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    chat:{
        type:Schema.Types.ObjectId,
        ref:"Chat",
        required:true
    }
},{timestamps: true});

export const Message = models?.Message || mongoose.model("Message", messageSchema);