import { Post } from "../../models/post/post.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { sendResponse } from "../../utils/SendResponse.js";
import { Comment } from "../../models/post/comment.model.js"
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

const addComment = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { text } = req?.body;
        const { postId } = req?.params;
        const { path } = req?.file;

        if(!postId)
            return next(new ErrorHandler("All fields are required", 400));

        if(!text && !path)
            return next(new ErrorHandler("All fields are required", 400));

        const {url:media} = await uploadOnCloudinary(path);

        if(!media)
            return next(new ErrorHandler("Media not uploaded Properly!", 400));

        const post = await Post.findById(postId);

        if (!post)
            return next(new ErrorHandler("Post not found!", 400));

        const createComment = await Comment.create({text,media,owner:req.user.id,referenceId:postId});

        if (!createComment)
            return next(new ErrorHandler("Comment not created Properly!", 400));

        return sendResponse(res, 200, "Comment added Successfully!", true, createComment, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const EditComment = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { text } = req?.body;
        const { id } = req?.params;

        if(!id || !text)
            return next(new ErrorHandler("All fields are required", 400));

        const editComment = await Comment.updateOne({_id:id,owner:req.user.id},{text});

        if (!editComment)
            return next(new ErrorHandler("Comment not updated Properly!", 400));

        return sendResponse(res, 200, "Comment updated Successfully!", true, editComment, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteComment = async (req,res,next) => {
    console.log("delete comment")
}

const getAllComment = async (req,res,next) => {
    console.log("get all comment")
}

export {
    addComment,
    EditComment,
    deleteComment,
    getAllComment
}