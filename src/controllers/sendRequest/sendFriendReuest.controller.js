import { User } from "../../models/user/user.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { Request } from "../../models/notification/request.model.js";
import { sendResponse } from "../../utils/SendResponse.js";

const sendFriendRequest = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { userId } = await req?.params;

        if (!userId)
            return next(new ErrorHandler("Please provide user id", 400));

        const user = await User.findById(userId);

        if (!user)
            return next(new ErrorHandler("User not found", 400));

        const request = await Request.findOne({$or:[{from: req.user.id, to: userId, status: "pending" },{to: req.user.id, from: userId, status: "pending" }]});

        if (request)
            return next(new ErrorHandler("Friend request already sent", 400));

        const friendRequest = await Request.create({ from: req.user.id, to: userId, status: "pending" });

        if (!friendRequest)
            return next(new ErrorHandler("Failed to send friend request", 400));

        return sendResponse(res, 200, "Friend request sent successfully", true, friendRequest, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const acceptFriendRequest = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { requestId } = req?.params;

        if(!requestId)
            return next(new ErrorHandler("All fields are required", 400));

        const request = await Request.findById(requestId);

        if (!request)
            return next(new ErrorHandler("Friend request not found", 400));

        if (request.to.toString() !== req.user.id)
            return next(new ErrorHandler("You are not authorized to accept this friend request", 400));

        if (request.status !== "pending")
            return next(new ErrorHandler("Friend request already accepted", 400));

        request.status = "accepted";
        await request.save();

        return sendResponse(res, 200, "Friend request accepted successfully", true, request, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const ignoreFriendRequest = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { requestId } = req?.params;

        if(!requestId)
            return next(new ErrorHandler("All fields are required", 400));

        const request = await Request.findById(requestId);

        if (!request)
            return next(new ErrorHandler("Friend request not found", 400));

        if (request.to.toString() !== req.user.id)
            return next(new ErrorHandler("You are not authorized to accept this friend request", 400));

        if (request.status !== "pending")
            return next(new ErrorHandler("Friend request already accepted", 400));

        const requestIgnored = await Request.findByIdAndDelete(requestId);

        if (!requestIgnored)
            return next(new ErrorHandler("Failed to ignore friend request", 400));

        return sendResponse(res, 200, "Friend request accepted successfully", true, requestIgnored, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getListOfFriendRequest = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const friendRequest = await Request.find({ to: req.user.id, status: "pending" }).populate("from");

        if (!friendRequest)
            return next(new ErrorHandler("No friend request found", 400));

        return sendResponse(res, 200, "Friend request fetched successfully", true, friendRequest, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    sendFriendRequest,
    acceptFriendRequest,
    ignoreFriendRequest,
    getListOfFriendRequest
}
