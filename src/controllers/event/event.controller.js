import { Member } from "../../models/newsletter/member.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { Event } from "../../models/event/event.model.js";
import { sendResponse } from "../../utils/SendResponse.js";
import mongoose from "mongoose";

const createEvent = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { name, type, organizer, description, timezone, startDate, startTime, endDate, endTime, speakers, externalLink, address } = req?.body;
        const { path: backgroundImage } = req?.file;
        let backgroundImageUrl = null;

        if (!name || !type || !organizer || !description || !timezone || !startDate || !startTime || !endDate || !endTime || !speakers || !externalLink)
            return next(new ErrorHandler("All fields are required", 400));

        if (backgroundImage) {
            const { url } = await uploadOnCloudinary(backgroundImage);
            if (!url)
                return next(new ErrorHandler("Media not uploaded Properly!", 400));
            backgroundImageUrl = url;
        }

        if (backgroundImage && !backgroundImageUrl)
            return next(new ErrorHandler("Media not uploaded Properly!", 400));

        const event = await Event.create({ name, type, organizer, description, timezone, startDate, startTime, endDate, endTime, speakers, externalLink, address, backgroundImage: backgroundImageUrl, creator: req.user.id });

        if (!event)
            return next(new ErrorHandler("Event not created Properly!", 400));

        const members = await Member.create({ user: req.user.id, type: "event", referenceId: event.id });

        if (!members)
            return next(new ErrorHandler("Please login!", 400));

        return sendResponse(res, 200, "Event created successfully!", true, { event, members }, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editEvent = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { name, type, organizer, description, timezone, startDate, startTime, endDate, endTime, speakers, externalLink, address } = req?.body;
        const { id } = req?.params;
        const { path: backgroundImage } = req?.file;
        let backgroundImageUrl = null;

        if (!name || !type || !organizer || !description || !timezone || !startDate || !startTime || !endDate || !endTime || !speakers || !externalLink || !id)
            return next(new ErrorHandler("All fields are required", 400));

        if (backgroundImage) {
            const { url } = await uploadOnCloudinary(backgroundImage);
            if (!url)
                return next(new ErrorHandler("Media not uploaded Properly!", 400));
            backgroundImageUrl = url;
        }

        if (backgroundImage && !backgroundImageUrl)
            return next(new ErrorHandler("Media not uploaded Properly!", 400));

        const event = await Event.findByIdAndUpdate(id, { name, type, organizer, description, timezone, startDate, startTime, endDate, endTime, speakers, externalLink, address, backgroundImage: backgroundImageUrl, creator: req.user.id }, { new: true });

        if (!event)
            return next(new ErrorHandler("Event not updated Properly!", 400));

        return sendResponse(res, 200, "Event updated successfully!", true, event, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteEvent = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));

        const event = await Event.findByIdAndDelete(id);

        if (!event)
            return next(new ErrorHandler("Event not deleted Properly!", 400));

        const members = await Member.deleteMany({ referenceId: event.id });

        return sendResponse(res, 200, "Event deleted successfully!", true, { event, members }, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const listAllEvent = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const events = await Event.aggregate([
            {
                $match: {
                    endDate: { $gte: new Date() }
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "organizer",
                    foreignField: "_id",
                    as: "organizer"
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

        if (!events)
            return next(new ErrorHandler("Events not found Properly!", 400));

        return sendResponse(res, 200, "Events fetched successfully!", true, events, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getUserEvents = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const event = await Event.aggregate([
            {
                $match: { creator: new mongoose.Types.ObjectId(req.user.id) }
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

        if (!event)
            return next(new ErrorHandler("Events not found!", 400));

        return sendResponse(res, 200, "Events fetched successfully!", true, event, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const joinEvent = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));

        const event = await Event.findById(id);

        if (!event)
            return next(new ErrorHandler("Event not found!", 400));

        const members = await Member.create({ user: req.user.id, type: "event", referenceId: event.id });

        if (!members)
            return next(new ErrorHandler("Please login!", 400));

        return sendResponse(res, 200, "Event joined successfully!", true, { event, members }, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    createEvent,
    editEvent,
    deleteEvent,
    listAllEvent,
    getUserEvents,
    joinEvent
}