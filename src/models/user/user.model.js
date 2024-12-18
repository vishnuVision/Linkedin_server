import mongoose,{ Schema, Types } from "mongoose";
const {models} = mongoose;

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:String,
    username:String,
    firstName: String,
    lastName: String,
    additionalName: String,
    avatar: String,
    backgroundImage: String,
    bio: String,
    location: String,
    profileShow: {
        type: String,
        enum: ["connection","anyone","none"],
        default:"anyone"
    },
    industry: String,
    educations: [
        {
            type: Types.ObjectId,
            ref: "Education"
        }
    ],
    experiences: [
        {
            type: Types.ObjectId,
            ref: "Experience"
        }
    ],
    region: String,
    city: String,
    phoneNumber: String,
    phoneType:{
        type:String,
        enum:["Mobile","Work","Home"],
    },
    address: String,
    birthday: Date,
    views: Number,
    followers: [
        {
            type: Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: Types.ObjectId,
            ref: "User"
        }
    ],
    pronouns:{
        type: String,
        enum: ["He/Him","She/Her","They/Them","Other",""],
        default:""
    },
    about:String,
    website:String,
    language:{
        type: String,
        enum:["English","Hindi"],
        default:"English"
    },
    isJobAccountVerified:{
        type: Boolean,
        default: false
    }
},{timestamps: true});

export const User = models?.User || mongoose.model("User",userSchema);