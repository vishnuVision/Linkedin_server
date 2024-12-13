import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const requestSchema = Schema({
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
    status: {
        type: String,
        enum: ["pending","accepted","rejected"],
        default:"pending"
    }
},{timestamps: true});

export const Request = models?.Request || mongoose.model("Request", requestSchema);