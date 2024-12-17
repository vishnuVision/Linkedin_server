import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const eventSchema = Schema({
    organizer:{
        type: Schema.Types.ObjectId,
        ref: "User",
        ref: "Page",
        required: true
    },
    type:{
        type: String,
        enum: ["Online","In person"],
        required: true
    },
    name:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    timezone: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    speakers:[
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    backgroundImage: {
        type: String,
        required: true
    },
    externalLink: {
        type: String,
        required: true
    },
    creator:{
        type: Schema.Types.ObjectId,
        ref: "User",
        ref: "Page",
        required: true
    },
    address: String,
},{timestamps: true});

export const Event = models?.Event || mongoose.model("Event", eventSchema);