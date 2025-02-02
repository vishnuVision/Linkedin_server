import { Post } from "../../models/post/post.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { sendResponse } from "../../utils/SendResponse.js";
import { Comment } from "../../models/post/comment.model.js"
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import mongoose from "mongoose";
import { User } from "../../models/user/user.model.js";
import { COMMENT_POST } from "../../utils/events.js";
import { emitEvent } from "../../utils/getMemberSocket.js";
import { Like } from "../../models/post/like.model.js";

const addComment = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { text } = req?.body;
        const { postId } = req?.params;
        const path = req?.file?.path;

        if (!postId)
            return next(new ErrorHandler("All fields are required", 400));

        if (!text && !path)
            return next(new ErrorHandler("All fields are required", 400));

        let media;
        if (path) {
            const { url } = await uploadOnCloudinary(path);
            media = url;

            if (!media)
                return next(new ErrorHandler("Media not uploaded Properly!", 400));
        }

        const post = await Post.findById(postId);

        if (!post)
            return next(new ErrorHandler("Post not found!", 400));

        const createComment = await Comment.create({ text, media, owner: req.user.id, referenceId: postId });

        if (!createComment)
            return next(new ErrorHandler("Comment not created Properly!", 400));

        const user = await User.findById(req.user.id).select("+firstName +lastName +avatar +_id +bio");

        if (!user)
            return next(new ErrorHandler("User not found!", 400));

        emitEvent(req, next, COMMENT_POST, { post, user }, post.author);

        return sendResponse(res, 200, "Comment added Successfully!", true, { ...createComment._doc, owner: user }, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const EditComment = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { text } = req?.body;
        const { postId, id } = req?.params;

        if (!postId || !id || !text)
            return next(new ErrorHandler("Please try again!", 400));

        const post = await Post.findById(postId);

        if (!post)
            return next(new ErrorHandler("Post not found!", 400));

        let editComment;

        if (post.author.toString() === req.user.id.toString()) {
            editComment = await Comment.findOneAndUpdate({ _id: id }, { text }, { new: true }).populate({ path: "subComments", populate: { path: "owner", select: "+firstName +lastName +avatar +_id +bio" } }).lean();
        }
        else {
            editComment = await Comment.findOneAndUpdate({ _id: id, owner: req.user.id }, { text }, { new: true }).populate({ path: "subComments", populate: { path: "owner", select: "+firstName +lastName +avatar +_id +bio" } }).lean();            
        }

        if (!editComment)
            return next(new ErrorHandler("Comment not updated Properly!", 400));

        const mainCommentLikes = await Like.find({ post: id });
        editComment.likeCount = mainCommentLikes.length;
        editComment.isLike = mainCommentLikes.some(
            (like) => like.owner.toString() === req.user.id.toString()
        );

        if (editComment.subComments && editComment.subComments.length > 0) {
            const subCommentIds = editComment.subComments.map((sub) => sub._id);
            const subCommentLikes = await Like.find({ post: { $in: subCommentIds } });

            editComment.subComments = editComment.subComments.map((subComment) => {
                const subLikes = subCommentLikes.filter(
                    (like) => like.post.toString() === subComment._id.toString()
                );
                return {
                    ...subComment,
                    likeCount: subLikes.length,
                    isLike: subLikes.some(
                        (like) => like.owner.toString() === req.user.id
                    ),
                };
            });
        }

        const user = await User.findOne({ _id: editComment.owner }).select("+firstName +lastName +avatar +_id +bio").lean();

        if (!user)
            return next(new ErrorHandler("User not found!", 400));

        return sendResponse(res, 200, "Comment updated Successfully!", true, { ...editComment, owner: user }, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteComment = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { postId, id } = req?.params;

        if (!postId || !id)
            return next(new ErrorHandler("Please try again!", 400));

        const post = await Post.findById(postId);

        if (!post)
            return next(new ErrorHandler("Post not found!", 400));

        let comment;

        if (post.author.toString() === req.user.id.toString()) {
            comment = await Comment.findOneAndDelete({ _id: id });
        }
        else {
            comment = await Comment.findOneAndDelete({ _id: id, owner: req.user.id });
        }

        if (!comment)
            return next(new ErrorHandler("Comment not deleted Properly!", 400));

        if (comment.subComments.length > 0) {
            await Comment.deleteMany({ _id: { $in: comment.subComments } });
        }

        if (comment.isSubComment) {
            if (comment.parentComment) {
                await Comment.updateOne({ _id: comment.parentComment }, { $pull: { subComments: comment._id } });
            }
        }

        return sendResponse(res, 200, "Comment deleted Successfully!", true, comment, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllComment = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { postId } = req?.params;

        if (!postId)
            return next(new ErrorHandler("All fields are required", 400));

        const comments = await Comment.aggregate([
            {
                $match: {
                    referenceId: new mongoose.Types.ObjectId(postId),
                    isSubComment: false,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                },
            },
            {
                $unwind: {
                    path: "$owner",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "subComments",
                    foreignField: "_id",
                    as: "subComments",
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "post",
                    as: "likes",
                },
            },
            {
                $addFields: {
                    likeCount: { $size: "$likes" },
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "subComments._id",
                    foreignField: "post",
                    as: "subCommentLikes",
                },
            },
            {
                $addFields: {
                    subComments: {
                        $map: {
                            input: "$subComments",
                            as: "subComment",
                            in: {
                                $mergeObjects: [
                                    "$$subComment",
                                    {
                                        likeCount: {
                                            $size: {
                                                $filter: {
                                                    input: "$subCommentLikes",
                                                    as: "like",
                                                    cond: { $eq: ["$$like.post", "$$subComment._id"] },
                                                },
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    owner: {
                        _id: 1,
                        avatar: 1,
                        firstName: 1,
                        lastName: 1,
                        createdAt: 1,
                    },
                    media: 1,
                    createdAt: 1,
                    text: 1,
                    subComments: 1,
                    likeCount: 1,
                },
            },
        ]);

        if (!comments)
            return next(new ErrorHandler("Comments not found!", 400));

        return sendResponse(res, 200, "Comment fetched Successfully!", true, comments, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const addSubComment = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { text, isSubComment = false } = req?.body;
        const { postId, commentId } = req?.params;
        const path = req?.file?.path;

        if (!postId || !commentId)
            return next(new ErrorHandler("All fields are required", 400));

        if (!text && !path)
            return next(new ErrorHandler("All fields are required", 400));

        let media;
        if (path) {
            const { url } = await uploadOnCloudinary(path);
            media = url;

            if (!media)
                return next(new ErrorHandler("Media not uploaded Properly!", 400));
        }

        const post = await Post.findById(postId);

        if (!post)
            return next(new ErrorHandler("Post not found!", 400));

        const createsubComment = await Comment.create({ text, media, owner: req.user.id, referenceId: postId, parentComment: commentId, isSubComment });

        if (!createsubComment)
            return next(new ErrorHandler("SubComment not created Properly!", 400));

        const comment = await Comment.findOneAndUpdate(
            { _id: commentId },
            { $push: { subComments: createsubComment._id } },
            { new: true }
        );

        if (!comment)
            return next(new ErrorHandler("Comment not updated Properly!", 400));

        const user = await User.findById(req.user.id).select("+firstName +lastName +avatar").lean();

        if (!user)
            return next(new ErrorHandler("User not found!", 400));

        emitEvent(req, next, COMMENT_POST, { post, user }, post.author);

        return sendResponse(res, 200, "Comment added Successfully!", true,{...createsubComment._doc,owner:user}, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    addComment,
    EditComment,
    deleteComment,
    getAllComment,
    addSubComment,
}