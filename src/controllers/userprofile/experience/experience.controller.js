import { ErrorHandler } from "../../../utils/ErrorHandler.js";
import { Experience } from "../../../models/user/experience.model.js"
import { sendResponse } from "../../../utils/SendResponse.js";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";

const createExperience = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { company, title, startMonth, startYear, endYear, endMonth, description, employmentType, location, locationType, skills = ["Java", "Javascript"], isPresent } = req?.body;
        const files = req.files || [];

        if (!company || !title || !startMonth || !startYear || !endMonth || !endYear || !description || !employmentType || !location || !locationType)
            return next(new ErrorHandler("All fields are required", 400));

        let media = [];
        if (files.length > 0) {
            const uploadFilesOnCloudinaryPromise = await Promise.all(files.map(async (file) => {
                try {
                    const { url } = await uploadOnCloudinary(file.path, next, {
                        transformation: [
                            { width: 1024, height: 1024, crop: "limit" },
                            { quality: "auto:low" },
                            { fetch_format: "auto" }
                        ]
                    });
                    return { url };
                } catch (error) {
                    return next(new ErrorHandler(error.message, 500));
                }
            }))

            media = uploadFilesOnCloudinaryPromise;
        }

        if (files.length > 0 && media.length === 0)
            return next(new ErrorHandler("Images not uploaded", 400));
        
        const experience = await Experience.create({ company, title, startMonth, startYear, endYear, endMonth, description, employmentType, location, locationType, skills, media, employee: req.user.id, isPresent });

        if (!experience)
            return next(new ErrorHandler("Experience not created", 400));

        return sendResponse(res, 200, "Experience created successfully!", true, experience, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editExperience = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { company, title, startMonth, startYear, endYear, endMonth, description, employmentType, location, locationType, skills = ["Java", "Javascript"], isPresent } = req?.body;
        const files = req.files || [];
        const { id } = req?.params;

        if (!company || !title || !id || !startMonth || !startYear || !endMonth || !endYear || !description || !employmentType || !location || !locationType)
            return next(new ErrorHandler("All fields are required", 400));

        let media = [];
        if (files.length > 0) {
            const uploadFilesOnCloudinaryPromise = await Promise.all(files.map(async (file) => {
                try {
                    const { url } = await uploadOnCloudinary(file.path, next, {
                        transformation: [
                            { width: 1024, height: 1024, crop: "limit" },
                            { quality: "auto:low" },
                            { fetch_format: "auto" }
                        ]
                    });
                    return { url };
                } catch (error) {
                    return next(new ErrorHandler(error.message, 500));
                }
            }))

            media = uploadFilesOnCloudinaryPromise;
        }

        if (files.length > 0 && media.length === 0)
            return next(new ErrorHandler("Images not uploaded", 400));
        
        const experience = await Experience.findOneAndUpdate({employee: req.user.id,_id: id},{ company, title, startMonth, startYear, endYear, endMonth, description, employmentType, location, locationType, skills, media, employee: req.user.id, isPresent },{new: true});

        if (!experience)
            return next(new ErrorHandler("Experience not updated", 400));

        return sendResponse(res, 200, "Experience updated successfully!", true, experience, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteExperience = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req.params;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));
        
        const experience = await Experience.findOneAndDelete({employee: req.user.id,_id: id});

        if (!experience)
            return next(new ErrorHandler("Experience not deleted", 400));

        return sendResponse(res, 200, "Experience deleted successfully!", true, experience, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllExperiences = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));
        
        const experience = await Experience.find({employee: req.user.id});

        if (!experience)
            return next(new ErrorHandler("Experience not found!", 400));

        return sendResponse(res, 200, "Experience fetched successfully!", true, experience, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    createExperience,
    editExperience,
    deleteExperience,
    getAllExperiences
}