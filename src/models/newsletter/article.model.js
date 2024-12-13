import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const articleSchema = Schema({
    image: String,
    title: String,
    description: String,
    newsletter:{
        type: Schema.Types.ObjectId,
        ref: "Newsletter"
    },
},{timestamps: true});

export const Article = models?.Article || mongoose.model("Article", articleSchema);