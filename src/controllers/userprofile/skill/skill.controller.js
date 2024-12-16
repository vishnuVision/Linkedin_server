import { Skill } from "../../../models/user/skill.model.js";
import { ErrorHandler } from "../../../utils/ErrorHandler.js";
import { sendResponse } from "../../../utils/SendResponse.js";

const createSkill = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {name, isTop=false } = req?.body;

        if (!name)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const skill = await Skill.create({name, isTop, owner: req.user.id});

        if(!skill)
            return sendResponse(res, 400, "Skill not created Properly!", false, null, null);

        return sendResponse(res, 200, "Skill created successfully!", true, skill, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteSkill = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if (!id)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const skill = await Skill.findByIdAndDelete(id);

        if(!skill)
            return sendResponse(res, 400, "Skill not deleted Properly!", false, null, null);

        return sendResponse(res, 200, "Skill deleted successfully!", true, skill, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllSkills = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const skills = await Skill.find({owner: req.user.id});

        if(!skills)
            return sendResponse(res, 400, "Skill not found!", false, null, null);

        return sendResponse(res, 200, "Skill fetched successfully!", true, skills, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editSkill = async (req,res,next) => {
    // not tested
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {id} = req?.params;
        const {reference} = req?.body;

        if (!id || !reference)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const skill = await Skill.findByIdAndUpdate(id, {reference}, {new: true});

        if(!skill)
            return sendResponse(res, 400, "Skill not updated Properly!", false, null, null);

        return sendResponse(res, 200, "Skill fetched successfully!", true, skill, null);
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

const endorseSkill = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));
    }
    catch(error)
    {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    createSkill,
    deleteSkill,
    getAllSkills,
    editSkill,
    endorseSkill
}