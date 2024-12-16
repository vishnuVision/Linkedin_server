import { Post } from "../../models/post/post.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { uploadOnCloudinary,uploadLargeVideo } from "../../utils/cloudinary.js";
import { sendResponse } from "../../utils/SendResponse.js";
import { User } from "../../models/user/user.model.js";

const createPost = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { text, viewPriority, author, referenceId, isVideo = false } = req?.body;
        const files = req.files || [];

        if (!viewPriority || !author)
            return next(new ErrorHandler("All fields are required", 400));

        if (!text && files.length === 0)
            return next(new ErrorHandler("All fields are required", 400));

        let media = [];
        if (files.length > 0) {
            const uploadFilesOnCloudinaryPromise = await Promise.all(files.map(async (file) => {
                try {
                    if (isVideo) {
                        const { url } = await uploadLargeVideo(file.path);
                        console.log(url);
                        return url;
                    }
                    else {
                        const { url } = await uploadOnCloudinary(file.path, next, {
                            transformation: [
                                { width: 1024, height: 1024, crop: "limit" },
                                { quality: "auto:low" },
                                { fetch_format: "auto" }
                            ]
                        });
                        return url;
                    }
                } catch (error) {
                    return next(new ErrorHandler(error.message, 500));
                }
            }))

            media = uploadFilesOnCloudinaryPromise;
        }

        if (files.length > 0 && media.length === 0)
            return next(new ErrorHandler("All fields are required", 400));

        const post = await Post.create({ text, viewPriority, author, referenceId, media });

        if (!post)
            return next(new ErrorHandler("Post not created Properly!", 400));

        return sendResponse(res, 200, "Post created Successfully!", true, post, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editPost = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { text, viewPriority } = req?.body;
        const { postId } = req?.params;

        if (!viewPriority || !postId)
            return next(new ErrorHandler("All fields are required", 400));

        const post = await Post.updateOne({ _id: postId },{ text, viewPriority });

        if (!post)
            return next(new ErrorHandler("Post not updated Properly!", 400));

        return sendResponse(res, 200, "Post updated Successfully!", true, post, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllPostDetails = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {followers,following} = await User.findById(req.user.id);

        const post = await Post.find({$or:[{viewPriority:"anyone"},{author:{ $in: [...followers, ...following,req.user.id] },viewPriority:"connection"}]});

        if (!post)
            return next(new ErrorHandler("Post not updated Properly!", 400));

        return sendResponse(res, 200, "Post updated Successfully!", true, post, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deletePost = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { postId } = req?.params;

        if(!postId)
            return next(new ErrorHandler("All fields are required", 400));

        const post = await Post.deleteOne({ _id: postId });

        if (!post)
            return next(new ErrorHandler("Post not deleted Properly!", 400));

        return sendResponse(res, 200, "Post deleted Successfully!", true, post, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    createPost,
    editPost,
    getAllPostDetails,
    deletePost
}

