import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const skillSchema = Schema({
    name:{
        type: String,
        required: true
    },
    isTop:{
        type: Boolean,
        default: false
    },
    endorsedBy:[{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    reference:[{
        type: Schema.Types.ObjectId,
        ref: "Education",
        ref: "Experience",
    }],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true});

export const Skill = models?.Skill || mongoose.model("Skill", skillSchema);