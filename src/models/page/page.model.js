import mongoose,{ Schema } from "mongoose";
const { models } = mongoose;

const pageSchema = Schema({
    type:{
        type: String,
        enum: ["company","school","event"],
        required: true
    },
    name:{
        type: String,
        required: true,
        unique: true
    },
    website:{
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true
    },
    organizationSize:{
        type: String,
        enum:["0-1 employees","2-10 employees","11-50 employees","51-200 employees","201-500 employees","501-1000 employees","1001-5000 employees","5001-10000 employees","10001+ employees"],
        required: true
    },
    organizationType:{
        type: String,
        enum:["Public company","Privately held","Self-employed","Government agency","Nonprofit","Sole proprietorship","Partnership"],
        required: true
    },
    logo:{
        type: String,
        required: true
    },
    coverImage:{
        type: String,
    },
    tagline:{
        type: String,
        required: true
    },
    followers:[{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    linkedin_url: String,
    overview: String,
    phone: String,
    year_found: String,
    specialities:String,
    locations:[String],
    language:{
        type: String,
        enum:["English","Hindi"],
        default:"English"
    }
},{timestamps: true});

export const Page = models?.Page || mongoose.model("Page", pageSchema);