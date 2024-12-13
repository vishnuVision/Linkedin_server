import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const notificationSchema = Schema({
    from:{
        type: Schema.Types.ObjectId,
        ref: "User",
        ref: "Page",
    },
    to:{
        type: Schema.Types.ObjectId,
        ref: "User",
        ref: "Page",
    },
    type: {
        type: String,
        enum: ["like","comment","visit"],
    },
    referenceId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        ref: "Article",
    }
},{timestamps: true});

export const Notification = models?.Notification || mongoose.model("Notification", notificationSchema);