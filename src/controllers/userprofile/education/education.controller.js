import { Catchup } from "../../../models/notification/catchup.model.js";
import { Education } from "../../../models/user/education.model.js";
import { Skill } from "../../../models/user/skill.model.js";
import { User } from "../../../models/user/user.model.js";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";
import { ErrorHandler } from "../../../utils/ErrorHandler.js";
import { NEW_CATCH_UP } from "../../../utils/events.js";
import { emitEvent } from "../../../utils/getMemberSocket.js";
import { sendResponse } from "../../../utils/SendResponse.js";

const createEducation = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { school, degree, fieldOfStudy, startMonth, startYear, endYear, endMonth, grade, activities, description, skills, mediatitle, mediaDescription } = req?.body;
        const files = req.files || [];

        if (!school || !degree || !fieldOfStudy || !startMonth || !startYear || !endYear || !endMonth || !grade || !activities || !description)
            return next(new ErrorHandler("All fields are required", 400));

        let media = [];
        if (files.length > 0) {
            const uploadFilesOnCloudinaryPromise = await Promise.all(files.map(async (file,index) => {
                try {
                    const { url } = await uploadOnCloudinary(file.path, next, {
                        transformation: [
                            { width: 1024, height: 1024, crop: "limit" },
                            { quality: "auto:low" },
                            { fetch_format: "auto" }
                        ]
                    });
                    return { url, title: mediatitle[index], description: mediaDescription[index] };
                } catch (error) {
                    return next(new ErrorHandler(error.message, 500));
                }
            }))

            media = uploadFilesOnCloudinaryPromise;
        }

        if (files.length > 0 && media.length === 0)
            return next(new ErrorHandler("Images not uploaded", 400));
        
        const education = await Education.create({ school, degree, fieldOfStudy, startMonth, startYear, endYear, endMonth, grade, activities, description, media, alumini: req.user.id });

        if (!education)
            return next(new ErrorHandler("Education not created", 400));

        let skillList = [];

        if(skills.length > 0)
        {
            const skillsPromise = await Promise.all(skills?.map(async (skill) => {
                const skillObj = await Skill.findOne({ name: skill, owner: req.user.id });
                if (skillObj===null)
                {
                    const skilldata = await Skill.create({ name: skill, owner: req.user.id, reference: [education._id] });
                    return skilldata;
                }
                else
                {
                    const skilldata = await Skill.findByIdAndUpdate(skillObj._id, { reference: [...skillObj.reference, education._id] }, { new: true });
                    return skilldata;
                }
            }));
            skillList = skillsPromise;
        }

        await Catchup.create({ owner: req.user.id, type: "education", referenceId: education._id });

        const user = await User.findById(req.user.id);

        if(!user)
            return next(new ErrorHandler("User not found", 400));

        const { followers, following } = user;

        emitEvent(req, next, NEW_CATCH_UP, null, [...followers, ...following])

        return sendResponse(res, 200, "Education created successfully!", true, {education,skills: skillList}, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editEducation = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { school, degree, fieldOfStudy, startMonth, startYear, endYear, endMonth, grade, activities, description, skills = ["Java", "Javascript"], isPresent } = req?.body;
        const files = req.files || [];
        const { id } = req.params;

        if (!school || !degree || !id || !fieldOfStudy || !startMonth || !startYear || !endYear || !endMonth || !grade || !activities || !description)
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
        
        const education = await Education.findOneAndUpdate({alumini: req.user.id,_id: id},{ school, degree, fieldOfStudy, startMonth, startYear, endYear, endMonth, grade, activities, description, skills, media, alumini: req.user.id, isPresent },{new: true});

        if (!education)
            return next(new ErrorHandler("Education not updated", 400));

        return sendResponse(res, 200, "Education updated successfully!", true, education, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteEducation = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req.params;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));
        
        const education = await Education.findOneAndDelete({alumini: req.user.id,_id: id});

        if (!education)
            return next(new ErrorHandler("Education not deleted", 400));

        return sendResponse(res, 200, "Education deleted successfully!", true, education, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllEducations = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));

        if (!req.user)
            return next(new ErrorHandler("Please login", 400));
        
        const education = await Education.find({alumini: id}).populate("school","logo name");

        if (!education)
            return next(new ErrorHandler("Education not found!", 400));

        return sendResponse(res, 200, "Education fetched successfully!", true, education, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    createEducation,
    editEducation,
    deleteEducation,
    getAllEducations
}