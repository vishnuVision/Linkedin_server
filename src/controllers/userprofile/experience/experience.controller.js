import { ErrorHandler } from "../../../utils/ErrorHandler.js";
import { Experience } from "../../../models/user/experience.model.js"
import { sendResponse } from "../../../utils/SendResponse.js";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";
import { Skill } from "../../../models/user/skill.model.js";
import { Catchup } from "../../../models/notification/catchup.model.js";
import { emitEvent } from "../../../utils/getMemberSocket.js";
import { NEW_CATCH_UP } from "../../../utils/events.js";
import { User } from "../../../models/user/user.model.js";
import mongoose from "mongoose";
import { title } from "process";

const createExperience = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { company, title, startMonth, startYear, endYear, endMonth, description, employmentType, location, locationType, skills, isPresent, mediatitle, mediaDescription } = req?.body;
        const files = req.files || [];

        if (!company || !title || !startMonth || !startYear || !description || !employmentType || !location || !locationType)
            return next(new ErrorHandler("All fields are required", 400));

        let media = [];
        if (files.length > 0) {
            const uploadFilesOnCloudinaryPromise = await Promise.all(files.map(async (file, index) => {
                try {
                    const { url } = await uploadOnCloudinary(file.path, next, {
                        transformation: [
                            { width: 1024, height: 1024, crop: "limit" },
                            { quality: "auto:low" },
                            { fetch_format: "auto" }
                        ]
                    });
                    return { url, title: typeof mediatitle === "string" ? mediatitle : mediatitle[index], description: typeof mediaDescription === "string" ? mediaDescription : mediaDescription[index] };
                } catch (error) {
                    return next(new ErrorHandler(error.message, 500));
                }
            }))

            media = uploadFilesOnCloudinaryPromise;
        }

        if (files.length > 0 && media.length === 0)
            return next(new ErrorHandler("Images not uploaded", 400));

        const experience = await Experience.create({ company, title, startMonth, startYear, endYear, endMonth, description, employmentType, location, locationType, media, employee: req.user.id, isPresent });

        if (!experience)
            return next(new ErrorHandler("Experience not created", 400));

        let skillList = [];
        let allSkills = [];

        if (typeof skills === "string" && skills) {
            allSkills = [skills];
        }
        else
        {
            if (skills?.length > 0)
                allSkills = [...skills];
        }

        if (allSkills?.length > 0) {
            const skillsPromise = await Promise.all(allSkills?.map(async (skill) => {
                const skillObj = await Skill.findOne({ name: skill, owner: req.user.id });
                if (skillObj === null) {
                    const skilldata = await Skill.create({ name: skill, owner: req.user.id, reference: [experience._id] });
                    return skilldata;
                }
                else {
                    const skilldata = await Skill.findByIdAndUpdate(skillObj._id, { reference: [...skillObj.reference, experience._id] }, { new: true });
                    return skilldata;
                }
            }));
            skillList = skillsPromise;
        }

        await Catchup.create({ owner: req.user.id, type: "job changes", referenceId: experience._id });

        const user = await User.findById(req.user.id);

        if (!user)
            return next(new ErrorHandler("User not found", 400));

        const { followers, following } = user;

        emitEvent(req, next, NEW_CATCH_UP, null, [...followers, ...following])

        return sendResponse(res, 200, "Experience created successfully!", true, { experience, skills: skillList }, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editExperience = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { company, title, startMonth, startYear, endYear = "", endMonth = "", description, employmentType, location, locationType, skills, isPresent, uploadedMedia, mediaDescription, mediatitle, deletedSkills } = req?.body;
        const files = req.files || [];
        const { id } = req?.params;
        let prevUploaded = [];

        if (uploadedMedia) {
            if (typeof uploadedMedia === "string" && uploadedMedia) {
                prevUploaded = [JSON.parse(uploadedMedia)];
            }
            else {
                if (uploadedMedia?.length > 0) {
                    prevUploaded = uploadedMedia.map((media) => {
                        return JSON.parse(media);
                    });
                }
                else {
                    prevUploaded = [JSON.parse(uploadedMedia)];
                }
            }
        }

        if (!company || !title || !id || !startMonth || !startYear || !description || !employmentType || !location || !locationType)
            return next(new ErrorHandler("All fields are required", 400));

        let skillList = [];
        let skillForDeletion = [];
        let otherSkills = [];

        if (typeof deletedSkills === "string" && deletedSkills) {
            skillForDeletion = [deletedSkills];
        }
        else
        {
            if (deletedSkills?.length > 0)
                skillForDeletion = [...deletedSkills];
        }

        if (skillForDeletion?.length > 0) {
            await Promise.all(skillForDeletion?.map(async (skill) => {
                const skillObj = await Skill.findOne({ name: skill, owner: req.user.id }).lean();
                if (skillObj !== null) {
                    const skilldata = await Skill.findByIdAndUpdate(skillObj._id, { reference: skillObj.reference.filter((reference) => reference.toString() !== id.toString()) }, { new: true });
                    return skilldata;
                }
            }));
        }
        if (typeof skills === "string" && skills) {
            otherSkills = [skills];
        }
        else
        {
            if (skills?.length > 0)
                otherSkills = [...skills];
        }

        if (otherSkills?.length > 0) {
            const skillsPromise = await Promise.all(otherSkills?.map(async (skill) => {
                const skillObj = await Skill.findOne({ name: skill, owner: req.user.id });
                if (skillObj === null) {
                    const skilldata = await Skill.create({ name: skill, owner: req.user.id, reference: [id] });
                    return skilldata;
                }
                else {
                    const skilldata = await Skill.findByIdAndUpdate(skillObj._id, { reference: [...skillObj.reference, id] }, { new: true });
                    return skilldata;
                }
            }));
            skillList = skillsPromise;
        }

        let media = [];
        let uploadFilesOnCloudinaryPromise = [];
        if (files.length > 0) {
            uploadFilesOnCloudinaryPromise = await Promise.all(files.map(async (file, index) => {
                try {
                    const { url } = await uploadOnCloudinary(file.path, next, {
                        transformation: [
                            { width: 1024, height: 1024, crop: "limit" },
                            { quality: "auto:low" },
                            { fetch_format: "auto" }
                        ]
                    });
                    return { url, title: typeof mediatitle === "string" ? mediatitle : mediatitle[index], description: typeof mediaDescription === "string" ? mediaDescription : mediaDescription[index] };
                } catch (error) {
                    return next(new ErrorHandler(error.message, 500));
                }
            }))
        }

        media = [...prevUploaded, ...uploadFilesOnCloudinaryPromise];

        if (files.length > 0 && media.length === 0)
            return next(new ErrorHandler("Images not uploaded", 400));

        const experience = await Experience.findOneAndUpdate({ employee: req.user.id, _id: id }, { company, title, startMonth, startYear, endYear, endMonth, description, employmentType, location, locationType, media, employee: req.user.id, isPresent }, { new: true });

        if (!experience)
            return next(new ErrorHandler("Experience not updated", 400));

        return sendResponse(res, 200, "Experience updated successfully!", true, experience, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteExperience = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req.params;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));

        const experience = await Experience.findOneAndDelete({ employee: req.user.id, _id: id });

        if (!experience)
            return next(new ErrorHandler("Experience not deleted", 400));

        return sendResponse(res, 200, "Experience deleted successfully!", true, experience, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllExperiences = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));

        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const experience = await Experience.aggregate([
            {
                $match: { employee: new mongoose.Types.ObjectId(id) }
            },
            {
                $addFields: {
                    company: {
                        $cond: {
                            if: {
                                $and: [
                                    { $eq: [{ $type: "$company" }, "string"] },
                                    {
                                        $regexMatch: {
                                            input: "$company",
                                            regex: /^[a-fA-F0-9]{24}$/,
                                            options: ""
                                        }
                                    }
                                ]
                            },
                            then: { $toObjectId: "$company" },
                            else: "$company"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "pages",
                    localField: "company",
                    foreignField: "_id",
                    as: "companyDetails"
                }
            },
            {
                $lookup: {
                    from: "skills",
                    let: { experienceId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$$experienceId", "$reference"]
                                }
                            }
                        }
                    ],
                    as: "skillsDetails"
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    startMonth: 1,
                    startYear: 1,
                    endMonth: 1,
                    endYear: 1,
                    isPresent: 1,
                    description: 1,
                    employmentType: 1,
                    location: 1,
                    locationType: 1,
                    media: 1,
                    skills: {
                        $map: {
                            input: "$skillsDetails",
                            as: "skill",
                            in: "$$skill.name"
                        }
                    },
                    company: {
                        $cond: {
                            if: { $eq: [{ $type: "$company" }, "objectId"] },
                            then: {
                                $let: {
                                    vars: {
                                        companyData: { $arrayElemAt: ["$companyDetails", 0] }
                                    },
                                    in: {
                                        _id: "$$companyData._id",
                                        logo: "$$companyData.logo",
                                        name: "$$companyData.name"
                                    }
                                }
                            },
                            else: {
                                _id: null,
                                logo: null,
                                name: "$company"
                            }
                        }
                    }
                }
            }
        ]);

        if (!experience)
            return next(new ErrorHandler("Experience not found!", 400));

        return sendResponse(res, 200, "Experience fetched successfully!", true, experience, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    createExperience,
    editExperience,
    deleteExperience,
    getAllExperiences
}