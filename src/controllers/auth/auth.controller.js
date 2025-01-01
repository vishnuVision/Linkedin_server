import { Page } from "../../models/page/page.model.js";
import { Education } from "../../models/user/education.model.js";
import { Experience } from "../../models/user/experience.model.js";
import { User } from "../../models/user/user.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { sendResponse } from "../../utils/SendResponse.js";
import jwt from "jsonwebtoken";

const login = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const user = await User.findOne({ email }).select("-password -__v");

        if (!user)
            return sendResponse(res, 400, "user not signup Properly!", false, null, null);

        const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        if (!token)
            return sendResponse(res, 400, "user not signup Properly!", false, null, null);

        return sendResponse(res, 200, "user signin successfully!", true, user, token);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const user = await User.findOne({ email });

        if (user)
            return sendResponse(res, 400, "User already exists", false, null, null);

        const userData = await User.create({ email });

        if (!userData)
            return sendResponse(res, 400, "user not signup Properly!", false, null, null);

        const token = await jwt.sign({ id: userData._id }, process.env.JWT_SECRET);

        if (!token)
            return sendResponse(res, 400, "user not signup Properly!", false, null, null);

        return sendResponse(res, 200, "user signup successfully!", true, userData, token);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllPages = async (req, res, next) => {
    try {
        const { type } = req?.params;

        let pages = [];
        if (type === "all") {
            pages = await Page.find().select("name _id")
        }
        else {
            pages = await Page.find({ type }).select("name _id")
        }

        if (!pages)
            return sendResponse(res, 400, "No Pages found", false, null, null);

        return sendResponse(res, 200, "Pages fetched successfully!", true, pages, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const addReuiredDetails = async (req, res, next) => {
    try {
        if (!req.user)
            return sendResponse(res, 400, "Please login", false, null, null);

        const { birthday, firstName, lastName, location, isStudent, mostRecentJob, mostRecentCompany, school, startYear, endYear, avatar } = req.body;

        if (!firstName || !lastName || !location || !avatar || !birthday)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        if (!isStudent && (!mostRecentJob || !mostRecentCompany))
            return sendResponse(res, 400, "All fields are required", false, null, null);

        if (isStudent && (!school || !startYear || !endYear))
            return sendResponse(res, 400, "All fields are required", false, null, null);

        let userData;
        if (isStudent) {
            const educations = await Education.create({ school, startYear, endYear, alumini: req.user.id });

            if (!educations)
                return sendResponse(res, 400, "education not created Properly!", false, null, null);

            userData = await User.findByIdAndUpdate(req.user.id, { firstName, lastName, location, avatar, educations, birthday }, { new: true });
        }
        else {
            const experiences = await Experience.create({ company: mostRecentCompany, title: mostRecentJob, employee: req.user.id });
            if (!experiences)
                return sendResponse(res, 400, "experience not created Properly!", false, null, null);

            userData = await User.findByIdAndUpdate(req.user.id, { firstName, lastName, location, avatar, experiences, birthday }, { new: true });
        }

        if (!userData)
            return sendResponse(res, 400, "user profile not updated Properly!", false, null, null);

        return sendResponse(res, 200, "user profile updated successfully!", true, userData, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getUserDetails = async (req, res, next) => {
    try {
        if (!req.user)
            return sendResponse(res, 400, "please login!", false, null, null);

        const userData = await User.findById(req.user.id).select("-password -__v").populate({
            path: "educations",
            populate: { path: "school" },
        }).populate({
            path: "experiences",
            populate: { path: "company" },
        });

        if (!userData)
            return sendResponse(res, 400, "user not signup Properly!", false, null, null);

        return sendResponse(res, 200, "user fetched successfully!", true, userData, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const logout = async (req, res, next) => {
    try {
        if (!req.user)
            return sendResponse(res, 400, "please login!", false, null, null);

        return res
            .status(200)
            .clearCookie("userToken", {
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "none",
                httpOnly: true,
                secure: true,
            })
            .json({ success: true, message: "user logout successfully!" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteUser = async (req, res, next) => {
    try {
        if (!req.user)
            return sendResponse(res, 400, "please login!", false, null, null);

        return res
            .status(200)
            .clearCookie("userToken")
            .json({ success: true, message: "user logout successfully!" });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getProfile = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password -__v");

        if (!user)
            return sendResponse(res, 400, "please login!", false, null, null);

        return sendResponse(res, 200, "user fetched successfully!", true, user, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    login,
    register,
    getUserDetails,
    logout,
    deleteUser,
    addReuiredDetails,
    getAllPages,
    getProfile
}