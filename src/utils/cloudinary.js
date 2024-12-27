import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (Localpath, next, options = {}) => {
    try {
        const file = await cloudinary.uploader.upload(Localpath, options);
        fs.unlinkSync(Localpath)
        return file;
    }
    catch (error) {
        throw error;
    }
}

const uploadLargeVideo = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "video",
            folder: "videos",
        });
        fs.unlinkSync(filePath)
        return result;
    } catch (error) {
        throw error;
    }
};

export {
    uploadOnCloudinary,
    uploadLargeVideo
}