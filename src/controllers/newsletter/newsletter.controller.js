import { Member } from "../../models/newsletter/member.model.js";
import { Newsletter } from "../../models/newsletter/newsletter.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { sendResponse } from "../../utils/SendResponse.js";
import mongoose from "mongoose";

const createNewsletter = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { title, description, publishRoutine } = req?.body;
        const { path: avatar } = req?.file;
        let avatarUrl = null;

        if (!title || !description || !publishRoutine || !avatar)
            return next(new ErrorHandler("All fields are required", 400));

        if (avatar) {
            const { url } = await uploadOnCloudinary(avatar);
            if (!url)
                return next(new ErrorHandler("Media not uploaded Properly!", 400));
            avatarUrl = url;
        }

        if (avatar && !avatarUrl)
            return next(new ErrorHandler("Media not uploaded Properly!", 400));

        const newsletter = await Newsletter.create({ title, description, publishRoutine, avatar: avatarUrl, author: req.user.id });

        if (!newsletter)
            return next(new ErrorHandler("Newsletter not created Properly!", 400));

        const members = await Member.create({ user: req.user.id, type: "newsletter", referenceId: newsletter.id });

        if (!members)
            return next(new ErrorHandler("Please login!", 400));

        return sendResponse(res, 200, "Newsletter created successfully!", true, { newsletter, members }, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editNewsletter = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { title, description, publishRoutine } = req?.body;
        const { id } = req?.params;
        const { path: avatar } = req?.file;
        let avatarUrl = null;

        if (!title || !description || !publishRoutine || !avatar || !id)
            return next(new ErrorHandler("All fields are required", 400));

        if (avatar) {
            const { url } = await uploadOnCloudinary(avatar);
            if (!url)
                return next(new ErrorHandler("Media not uploaded Properly!", 400));
            avatarUrl = url;
        }

        if (avatar && !avatarUrl)
            return next(new ErrorHandler("Media not uploaded Properly!", 400));

        const newsletter = await Newsletter.findByIdAndUpdate(id, { title, description, publishRoutine, avatar: avatarUrl, author: req.user.id }, { new: true });

        if (!newsletter)
            return next(new ErrorHandler("Newsletter not updated Properly!", 400));

        return sendResponse(res, 200, "Newsletter updated successfully!", true, newsletter, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteNewsletter = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));

        const newsletter = await Newsletter.findByIdAndDelete(id);

        if (!newsletter)
            return next(new ErrorHandler("NewsLetter not deleted Properly!", 400));

        const members = await Member.deleteMany({ referenceId: newsletter.id });

        return sendResponse(res, 200, "NewsLetter deleted successfully!", true, { newsletter, members }, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const listAllNewsletter = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const newsletters = await Newsletter.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $lookup: {
                    from: "members",
                    localField: "_id",
                    foreignField: "referenceId",
                    as: "members"
                }
            },
        ])

        if (!newsletters)
            return next(new ErrorHandler("Newsletters not found Properly!", 400));

        return sendResponse(res, 200, "Newsletters fetched successfully!", true, newsletters, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getUserNewsLetters = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const newsletter = await Newsletter.aggregate([
            {
                $match: { author: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $lookup: {
                    from: "members",
                    localField: "_id",
                    foreignField: "referenceId",
                    as: "members"
                }
            }
        ])

        if (!newsletter)
            return next(new ErrorHandler("Newsletters not found!", 400));

        return sendResponse(res, 200, "Newsletters fetched successfully!", true, newsletter, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const followNewsletter = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));

        const newsletter = await Newsletter.findById(id);

        if (!newsletter)
            return next(new ErrorHandler("Newsletter not found!", 400));

        const members = await Member.create({ user: req.user.id, type: "newsletter", referenceId: newsletter.id });

        if (!members)
            return next(new ErrorHandler("Please login!", 400));

        return sendResponse(res, 200, "Newsletter Subscribed by you!", true, { newsletter, members }, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    createNewsletter,
    editNewsletter,
    deleteNewsletter,
    listAllNewsletter,
    getUserNewsLetters,
    followNewsletter
}