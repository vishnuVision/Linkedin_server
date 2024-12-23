import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { Group } from "../../models/group/group.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { sendResponse } from "../../utils/SendResponse.js";
import { Member } from "../../models/newsletter/member.model.js";
import mongoose from "mongoose";

const createGroup = async (req,res,next) => {
    try {
        if(!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {name, description, industries, location, rules, type} = req?.body;
        const avatar = req?.file?.avatar;
        const backgroundImage = req?.file?.backgroundImage;
        let avatarUrl,backgroundImageUrl = null;

        if(!name || !description || !industries || !location || !rules || !type)
            return next(new ErrorHandler("All fields are required", 400));

        if(avatar)
        {
            const {url} = await uploadOnCloudinary(avatar[0]?.path);
            if(!url)
                return next(new ErrorHandler("Media not uploaded Properly!", 400));
            avatarUrl = url;
        }   

        if(backgroundImage)
        {
            const {url} = await uploadOnCloudinary(backgroundImage[0]?.path);
            if(!url)
                return next(new ErrorHandler("Media not uploaded Properly!", 400));
            backgroundImageUrl = url;
        }

        if(avatar && !avatarUrl)
            return next(new ErrorHandler("Media not uploaded Properly!", 400));

        if(backgroundImage && !backgroundImageUrl)
            return next(new ErrorHandler("Media not uploaded Properly!", 400));

        const group = await Group.create({name,description,industries,location,rules,type,avatar:avatarUrl,backgroundImage:backgroundImageUrl,creator:req.user.id});

        if(!group)
            return next(new ErrorHandler("Group not created Properly!", 400));

        const members = await Member.create({user:req.user.id,type:"group",referenceId:group.id});

        if(!members)
            return next(new ErrorHandler("Please login!", 400));

        return sendResponse(res, 200, "Group created successfully!", true, {group,members}, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editGroup = async (req,res,next) => {
    try {
        if(!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {name, description, industries, location, rules, type} = req?.body;
        const { id } = req?.params;
        const avatar = req?.file?.avatar;
        const backgroundImage = req?.file?.backgroundImage;
        let avatarUrl,backgroundImageUrl = null;

        if(!name || !description || !industries || !location || !rules || !type || !id)
            return next(new ErrorHandler("All fields are required", 400));

        if(avatar)
        {
            const {url} = await uploadOnCloudinary(avatar[0]?.path);
            if(!url)
                return next(new ErrorHandler("Media not uploaded Properly!", 400));
            avatarUrl = url;
        }   

        if(backgroundImage)
        {
            const {url} = await uploadOnCloudinary(backgroundImage[0]?.path);
            if(!url)
                return next(new ErrorHandler("Media not uploaded Properly!", 400));
            backgroundImageUrl = url;
        }

        if(avatar && !avatarUrl)
            return next(new ErrorHandler("Media not uploaded Properly!", 400));

        if(backgroundImage && !backgroundImageUrl)
            return next(new ErrorHandler("Media not uploaded Properly!", 400));

        let data = {name,description,industries,location,rules,type,creator:req.user.id};

        if(avatarUrl)
        {
            data = {...data,avatar:avatarUrl};
        }
        
        if(backgroundImageUrl)
        {
            data = {...data,backgroundImage:backgroundImageUrl};
        }

        const group = await Group.findByIdAndUpdate(id,data,{new:true});

        if(!group)
            return next(new ErrorHandler("Group not updated Properly!", 400));

        return sendResponse(res, 200, "Group updated successfully!", true, group, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const joinGroup = async (req,res,next) => {
    try {
        if(!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {id} = req?.params;

        if(!id)
            return next(new ErrorHandler("All fields are required", 400));

        const group = await Group.findById(id);

        if(!group)
            return next(new ErrorHandler("Group not found!", 400));

        const members = await Member.create({user:req.user.id,type:"group",referenceId:group.id});

        if(!members)
            return next(new ErrorHandler("Please login!", 400));

        return sendResponse(res, 200, "Group joined successfully!", true, {group,members}, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteGroup = async (req,res,next) => {
    try {
        if(!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {id} = req?.params;

        if(!id)
            return next(new ErrorHandler("All fields are required", 400));

        const group = await Group.findByIdAndDelete(id);

        if(!group)
            return next(new ErrorHandler("Group not deleted Properly!", 400));

        const members = await Member.deleteMany({referenceId:group.id});

        return sendResponse(res, 200, "Group deleted successfully!", true, {group,members}, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const listAllGroup = async (req,res,next) => {
    try {
        if(!req.user)
            return next(new ErrorHandler("Please login", 400));
        
        const groups = await Group.aggregate([
            {
                $lookup: {
                    from: "members",
                    localField: "_id",
                    foreignField: "referenceId",
                    as: "members"
                }
            },
            {
                $addFields: {
                    isMember: {
                        $in: [new mongoose.Types.ObjectId(req.user.id), "$members.user"]
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { type: "public" },
                        { isMember: true }
                    ]
                }
            },
            {
                $project: {
                    name: 1,
                    type: 1,
                    creator: 1,
                    membersCount: { $size: "$members" },
                    isMember: 1
                }
            }
        ])

        if(!groups)
            return next(new ErrorHandler("Groups not found Properly!", 400));

        return sendResponse(res, 200, "Groups fetched successfully!", true, groups, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAdminGroup = async (req,res,next) => {
    try {
        if(!req.user)
            return next(new ErrorHandler("Please login", 400));
        
        const groups = await Group.aggregate([
            {
                $match:{creator: new mongoose.Types.ObjectId(req.user.id)}
            },
            {
                $lookup:{
                    from:"members",
                    localField:"_id",
                    foreignField:"referenceId",
                    as:"members"
                }
            }
        ])

        if(!groups)
            return next(new ErrorHandler("Groups not found!", 400));

        return sendResponse(res, 200, "Groups fetched successfully!", true, groups, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    createGroup,
    editGroup,
    deleteGroup,
    listAllGroup,
    joinGroup,
    getAdminGroup
}