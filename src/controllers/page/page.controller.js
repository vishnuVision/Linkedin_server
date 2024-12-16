import { Page } from "../../models/page/page.model.js";
import { Post } from "../../models/post/post.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { sendResponse } from "../../utils/SendResponse.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js"

const createPage = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { type, name, website, industry, organizationSize, organizationType, tagline } = req.body;
        const { path } = req?.file;

        if (!type || !name || !website || !industry || !organizationSize || !organizationType || !tagline || !path)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const { url: avatar } = await uploadOnCloudinary(path);

        if (!avatar)
            return sendResponse(res, 400, "Media not uploaded Properly!", false, null, null);

        const createPage = await Page.create({ type, name, website, industry, organizationSize, organizationType, tagline, logo: avatar });

        if (!createPage)
            return sendResponse(res, 400, "page not created Properly!", false, null, null);

        return sendResponse(res, 200, "page created successfully!", true, createPage, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getPageDetails = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if (!id)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const page = await Page.findById(id);

        if (!page)
            return sendResponse(res, 400, "page not found!", false, null, null);

        return sendResponse(res, 200, "page fetched successfully!", true, page, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editPageDetails = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { name, website, industry, organizationSize, organizationType, tagline, overview, phone, year_founded, specialities, locations } = req.body;
        const { id } = req?.params;

        if (!name || !website || !industry || !organizationSize || !organizationType || !tagline || !overview || !phone || !year_founded || !specialities || !locations)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const page = await Page.findOneAndUpdate({ _id: id }, { name, website, industry, organizationSize, organizationType, tagline, overview, phone, year_founded, specialities, locations });

        if (!page)
            return sendResponse(res, 400, "page not created Properly!", false, null, null);

        return sendResponse(res, 200, "page created successfully!", true, page, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deactivatePage = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if (!id)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const page = await Page.findByIdAndDelete(id);

        if (!page)
            return sendResponse(res, 400, "page not created Properly!", false, null, null);

        return sendResponse(res, 200, "page created successfully!", true, page, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllPost = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if (!id)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const { followers } = await Page.findById(id);

        const post = await Post.find({ $or: [{ viewPriority: "anyone" }, { author: { $in: [...followers,id] }, viewPriority: "connection" }] });

        if (!post)
            return next(new ErrorHandler("Post not updated Properly!", 400));

        return sendResponse(res, 200, "Post updated Successfully!", true, post, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editCoverImage = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { path } = req?.file;
        const { id } = req?.params;

        if (!path || !id)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const { url: coverImage } = await uploadOnCloudinary(path);

        if (!coverImage)
            return sendResponse(res, 400, "Media not uploaded Properly!", false, null, null);

        const page = await Page.findOneAndUpdate({ _id: id }, { coverImage }, { new: true });

        if (!page)
            return sendResponse(res, 400, "Cover Image not updated Properly!", false, null, null);

        return sendResponse(res, 200, "Cover Image updated successfully!", true, page, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editLogo = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { path } = req?.file;
        const { id } = req?.params;

        if (!path || !id)
            return sendResponse(res, 400, "All fields are required", false, null, null);

        const { url: logo } = await uploadOnCloudinary(path);

        if (!logo)
            return sendResponse(res, 400, "Media not uploaded Properly!", false, null, null);

        const page = await Page.findOneAndUpdate({ _id: id }, { logo }, { new: true });

        if (!page)
            return sendResponse(res, 400, "Cover Image not updated Properly!", false, null, null);

        return sendResponse(res, 200, "Cover Image updated successfully!", true, page, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    createPage,
    getPageDetails,
    editPageDetails,
    deactivatePage,
    getAllPost,
    editCoverImage,
    editLogo
}


