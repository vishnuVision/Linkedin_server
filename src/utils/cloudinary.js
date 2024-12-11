import { v2 as cloudinary }  from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (Localpath) => {
    try {
        const file = await cloudinary.uploader.upload(Localpath);
        fs.unlinkSync(Localpath)
        return file;
    } 
    catch (error) {
        throw error;
    }
}

export {
    uploadOnCloudinary
}