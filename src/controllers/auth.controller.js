import { Education } from "../models/education.model.js";
import { Experience } from "../models/experience.model.js";
import { User } from "../models/user.model.js";
import { sendResponse } from "../utils/SendResponse.js";
import jwt from "jsonwebtoken";

const login = async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log(email)

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
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

const register = async (req, res, next) => {
    try {
        const { email, password,birthday,firstName, lastName, location, isStudent, mostRecentJob, mostRecentCompany, school, startYear, endYear, avatar } = req.body;
        
        if (!email || !firstName || !lastName || !location || !avatar || !birthday)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        if (!isStudent && (!mostRecentJob || !mostRecentCompany))
            return sendResponse(res, 400, "All fields are required", false, null, null);

        if (isStudent && (!school || !startYear || !endYear))
            return sendResponse(res, 400, "All fields are required", false, null, null);

        let userData;
        if (isStudent) {
            const educations = await Education.create({ school, startYear, endYear });

            if (!educations)
                return sendResponse(res, 400, "education not created Properly!", false, null, null);

            userData = await User.create({ email, password, firstName, lastName, location, avatar, educations, birthday });
        }
        else {
            const experiences = await Experience.create({ company: mostRecentCompany, title: mostRecentJob });
            if (!experiences)
                return sendResponse(res, 400, "experience not created Properly!", false, null, null);

            userData = await User.create({ email, password, firstName, lastName, location, avatar, experiences, birthday });
        }

        if (!userData)
            return sendResponse(res, 400, "user not signup Properly!", false, null, null);

        const token = await jwt.sign({ id: userData._id }, process.env.JWT_SECRET);

        if (!token)
            return sendResponse(res, 400, "user not signup Properly!", false, null, null);

        return sendResponse(res, 200, "user signup successfully!", true, userData, token);
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

const getUserDetails = async (req, res, next) => {
    try {
        if(!req.user)
            return sendResponse(res, 400, "please login!", false, null, null);

        const userData = await User.findById(req.user.id).select("-password -__v");

        if (!userData)
            return sendResponse(res, 400, "user not signup Properly!", false, null, null);

        return sendResponse(res, 200, "user fetched successfully!", true, userData, null);
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

const logout = async (req, res, next) => {
    try {
        if(!req.user)
            return sendResponse(res, 400, "please login!", false, null, null);

        return res
        .status(200)
        .clearCookie("userToken")
        .json({ success: true, message: "user logout successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

export {
    login,
    register,
    getUserDetails,
    logout
}