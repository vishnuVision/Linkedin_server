import { User } from "../../../models/user/user.model.js";
import { ErrorHandler } from "../../../utils/ErrorHandler.js";
import { sendResponse } from "../../../utils/SendResponse.js";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js"

const editProfile = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { firstName, lastName, additionalName, pronouns, bio, industry, region, city, website,email, phoneNumber, phoneType, address, birthday  } = req?.body;

        if (!firstName || !lastName || !additionalName || !pronouns || !bio || !industry || !region || !city || !website)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const user = await User.findByIdAndUpdate(req.user.id, { firstName, lastName, additionalName, pronouns, bio, industry, region, city, website, email, phoneNumber, phoneType, address, birthday }, { new: true });

        if(!user)
            return sendResponse(res, 400, "user profile not updated Properly!", false, null, null);

        return sendResponse(res, 200, "user profile updated successfully!", true, user, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editContactInformation = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { email, phoneNumber, phoneType, address, birthday  } = req?.body;

        if (!email || !phoneNumber || !phoneType || !address || !birthday)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const user = await User.findByIdAndUpdate(req.user.id, { email, phoneNumber, phoneType, address, birthday }, { new: true });

        if(!user)
            return sendResponse(res, 400, "user contact infomation not updated Properly!", false, null, null);

        return sendResponse(res, 200, "user contact infomation updated successfully!", true, user, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editBackgroundImage = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const path = req?.file?.path;

        if (!path)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const { url:backgroundImage } = await uploadOnCloudinary(path);

        if(!backgroundImage)
            return sendResponse(res, 400, "background image not uploaded Properly!", false, null, null);

        const user = await User.findByIdAndUpdate(req.user.id, {backgroundImage}, { new: true });

        if(!user)
            return sendResponse(res, 400, "background image not updated Properly!", false, null, null);

        return sendResponse(res, 200, "background image updated successfully!", true, user, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editAvatarImage = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const path = req?.file?.path;

        if (!path)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const { url:avatar } = await uploadOnCloudinary(path);

        if(!avatar)
            return sendResponse(res, 400, "avatar not uploaded Properly!", false, null, null);

        const user = await User.findByIdAndUpdate(req.user.id, {avatar}, { new: true });

        if(!user)
            return sendResponse(res, 400, "avatar not updated Properly!", false, null, null);

        return sendResponse(res, 200, "avatar updated successfully!", true, user, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editAbout = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {about} = req?.body;

        if (!about)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const user = await User.findByIdAndUpdate(req.user.id, {about}, { new: true });

        if(!user)
            return sendResponse(res, 400, "About not updated Properly!", false, null, null);

        return sendResponse(res, 200, "About updated successfully!", true, user, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    editProfile,
    editBackgroundImage,
    editAvatarImage,
    editAbout,
    editContactInformation
}