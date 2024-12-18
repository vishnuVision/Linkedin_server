import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const requestSchema = Schema({
    from:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    to:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["pending","accepted","rejected"],
        default:"pending"
    }
},{timestamps: true});

export const Request = models?.Request || mongoose.model("Request", requestSchema);