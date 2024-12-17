import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const groupSchema = Schema({
    name:{
        type: String,
        required: true
    },
    description: String,
    industries: [String],
    location: String,
    rules: String,
    type:{
        type: String,
        enum: ["public","private"],
        default:"public"
    },
    avatar: String,
    backgroundImage: String,
    creator:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
},{timestamps: true});

export const Group = models?.Group || mongoose.model("Group", groupSchema);