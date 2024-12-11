import mongoose,{ Schema, Types } from "mongoose";
const {models} = mongoose;

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    username:String,
    firstName: String,
    lastName: String,
    avatar: String,
    backgroundImage: String,
    bio: String,
    location: String,
    profileShow: {
        type: String,
        enum: ["connection","anyone","none"],
        default:"public"
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
    address: String,
    birthDay: Date,
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
        enum: ["He/Him","She/Her","They/Them","Other","Please Select"],
        default:"Please Select"
    },
    about:String,
    website:String,
    language:{
        type: String,
        enum:["English","Hindi"],
        default:"English"
    }
},{timestamps: true});

export const User = models?.User || mongoose.model("User",userSchema);