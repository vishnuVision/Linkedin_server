import { Catchup } from "../../models/notification/catchup.model.js";
import { User } from "../../models/user/user.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { sendResponse } from "../../utils/SendResponse.js";

const getAllCatchup = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const user = await User.findById(req.user.id);

        if (!user)
            return next(new ErrorHandler("User not found", 400));

        const catchup = await Catchup.find({
            owner: { $in: [...(user.following || []), ...(user.followers || [])] }
        })
            .populate("owner", "firstName lastName avatar")
            .populate({
                path: "referenceId",
                select: "company",
                populate: { path: "company", model: "Page", select: "name" }
            });

        if (!catchup)
            return next(new ErrorHandler("Catchup not found", 400));

        return sendResponse(res, 200, "Catchup fetched Successfully!", true, catchup, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    getAllCatchup
}