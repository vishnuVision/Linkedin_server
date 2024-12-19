import { Comment } from "../../models/post/comment.model.js";
import { Like } from "../../models/post/like.model.js";
import { Post } from "../../models/post/post.model.js";
import { User } from "../../models/user/user.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { LIKE_COMMENT, LIKE_POST } from "../../utils/events.js";
import { emitEvent } from "../../utils/getMemberSocket.js";
import { sendResponse } from "../../utils/SendResponse.js";

const addLike = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { postId } = req?.params;
        const { type="post" } = req?.body;

        if(!postId || !type)
            return next(new ErrorHandler("All fields are required", 400));

        const createLike = await Like.create({ owner: req.user.id, type, post: postId });

        if (!createLike)
            return next(new ErrorHandler("Like not added Properly!", 400));

        if(type==="post")
        {
            const post = await Post.findById(postId).select("+image +author +title +description");

            if (!post)
                return next(new ErrorHandler("Post not found!", 400));

            const user = await User.findById(req.user.id).select("+firstName +lastName +avatar");

            if (!user)
                return next(new ErrorHandler("User not found!", 400));

            emitEvent(req, next, LIKE_POST, { post, user } , post.author);
        }
        else
        {
            const comment = await Comment.findById(postId).select("+text +media");

            if (!comment)
                return next(new ErrorHandler("Comment not found!", 400));

            const user = await User.findById(req.user.id).select("+firstName +lastName +avatar");

            if (!user)
                return next(new ErrorHandler("User not found!", 400));

            emitEvent(req, next, LIKE_COMMENT, { comment, user } , comment.owner);
        }

        return sendResponse(res, 200, "Like added Successfully!", true, createLike, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const removeLike = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { postId } = req?.params;

        if(!postId)
            return next(new ErrorHandler("All fields are required", 400));

        const removeLike = await Like.deleteMany({ owner: req.user.id, post: postId });

        if (!removeLike)
            return next(new ErrorHandler("Like not removed Properly!", 400));

        return sendResponse(res, 200, "Like deleted Successfully!", true, removeLike, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllReactedUser = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { postId } = req?.params;

        if(!postId)
            return next(new ErrorHandler("All fields are required", 400));

        const post = await Post.findById(postId);

        if (!post)
            return next(new ErrorHandler("Post not found!", 400));

        const reactedUser = await Like.find({ post: postId }).populate("owner").select("-password -__v"); 

        if (!reactedUser)
            return next(new ErrorHandler("No Like found", 400));

        return sendResponse(res, 200, "reactedUser fetched Successfully!", true, reactedUser, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    addLike,
    removeLike,
    getAllReactedUser
}