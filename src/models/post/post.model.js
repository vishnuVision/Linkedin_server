import mongoose,{ Schema, Types } from "mongoose";
const { models } = mongoose;

const postSchema = Schema({
    text:String,
    image: String,
    title: String,
    description: String,
    type:{
        type: String,
        enum: ["post","article"],
        default:"post"
    },
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
    },
    authorType:{
        type: String,
        enum: ["user","page","group","event","newsletter"],
        default:"user"
    },
    referenceId:{
        type:Types.ObjectId,
        ref:"Page",
        ref:"Group",
        ref:"Event",
        ref:"Newsletter",
    }
},{timestamps: true});

export const Post = models?.Post || mongoose.model("Post", postSchema);