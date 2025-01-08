import { Post } from "../../models/post/post.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { uploadOnCloudinary, uploadLargeVideo } from "../../utils/cloudinary.js";
import { sendResponse } from "../../utils/SendResponse.js";
import { User } from "../../models/user/user.model.js";
import { Member } from "../../models/newsletter/member.model.js";
import { broadcastEvent, emitEvent } from "../../utils/getMemberSocket.js";
import { LOAD_MORE } from "../../utils/events.js";
import mongoose from "mongoose";

const createPost = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { text, viewPriority, referenceId, isVideo = false, authorType = "user" } = req?.body;
        const files = req?.files;

        if (!viewPriority || !authorType)
            return next(new ErrorHandler("All fields are required", 400));

        if (!text && files.length === 0)
            return next(new ErrorHandler("All fields are required", 400));

        let media = [];
        if (files.length > 0) {
            const uploadFilesOnCloudinaryPromise = await Promise.all(files.map(async (file) => {
                try {
                    if (isVideo == "false") {
                        const { url } = await uploadOnCloudinary(file.path, next, {
                            transformation: [
                                { width: 1024, height: 1024, crop: "limit" },
                                { quality: "auto:low" },
                                { fetch_format: "auto" }
                            ]
                        });
                        return url;
                    }
                    else {
                        const { url } = await uploadLargeVideo(file?.path);
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

        const post = await Post.create({ text, viewPriority, author: req.user.id, referenceId, media, authorType });

        if (!post)
            return next(new ErrorHandler("Post not created Properly!", 400));

        if (viewPriority === "connection") {
            const { followers, following } = await User.findById(req.user.id);
            emitEvent(req, next, LOAD_MORE, null, [...followers, ...following]);
        }
        else {
            broadcastEvent(req, next, LOAD_MORE, null);
        }

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

        const post = await Post.updateOne({ _id: postId }, { text, viewPriority });

        if (!post)
            return next(new ErrorHandler("Post not updated Properly!", 400));

        return sendResponse(res, 200, "Post updated Successfully!", true, post, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllPostDetails = async (req, res, next) => {
    try {
        const { page = 1 } = req?.query;
        const limit = 5;

        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { followers, following } = await User.findById(req.user.id);

        const post = await Post.aggregate([
            {
                $match: {
                    $or: [
                        { viewPriority: "anyone" },
                        { author: { $in: [...followers, ...following, req.user.id] }, viewPriority: "connection" }
                    ]
                }
            },
            {
                $lookup: {
                    from: "likes",
                    let: { postId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$post", "$$postId"] },
                                        { $eq: ["$type", "post"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "like"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    let: { postId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$referenceId", "$$postId"] },
                                        { $eq: ["$isSubComment", false] }
                                    ]
                                },
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                let: { userId: "$owner" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$_id", "$$userId"] },
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            firstName: 1,
                                            lastName: 1,
                                            username: 1,
                                            bio: 1,
                                            avatar: 1
                                        }
                                    }
                                ],
                                as: "owner"
                            }
                        },
                        {
                            $lookup: {
                                from: "likes",
                                let: { commentId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$post", "$$commentId"] },
                                                    { $eq: ["$type", "comment"] }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: "like"
                            }
                        },
                        {
                            $addFields: {
                                isLike: {
                                    $in: [new mongoose.Types.ObjectId(req.user.id), "$like.owner"]
                                },
                                likeCount: { $size: "$like" }
                            }
                        },
                        {
                            $lookup: {
                                from: "comments",
                                let: { commentId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$parentComment", "$$commentId"] },
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: "users",
                                            let: { userId: "$owner" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $and: [
                                                                { $eq: ["$_id", "$$userId"] },
                                                            ]
                                                        }
                                                    }
                                                },
                                                {
                                                    $project: {
                                                        firstName: 1,
                                                        lastName: 1,
                                                        username: 1,
                                                        bio: 1,
                                                        avatar: 1
                                                    }
                                                }
                                            ],
                                            as: "owner"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: "likes",
                                            let: { commentId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $and: [
                                                                { $eq: ["$post", "$$commentId"] },
                                                                { $eq: ["$type", "comment"] }
                                                            ]
                                                        }
                                                    }
                                                }
                                            ],
                                            as: "like"
                                        }
                                    },
                                    {
                                        $addFields: {
                                            isLike: {
                                                $in: [new mongoose.Types.ObjectId(req.user.id), "$like.owner"]
                                            },
                                            likeCount: { $size: "$like" },
                                            owner: {
                                                $arrayElemAt: ["$owner", 0]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            like: 0,
                                        }
                                    },
                                ],
                                as: "subComments"
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $arrayElemAt: ["$owner", 0]
                                }
                            }
                        },
                        {
                            $project: {
                                like: 0,
                            }
                        },
                    ],
                    as: "comment"
                }
            },
            {
                $addFields: {
                    likeCount: { $size: "$like" },
                    isLike: {
                        $in: [new mongoose.Types.ObjectId(req.user.id), "$like.owner"]
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $addFields: {
                                name: {
                                    $concat: ["$firstName", " ", "$lastName"]
                                },
                                description: "$bio"
                            }
                        },
                        {
                            $project: {
                                avatar: 1,
                                _id: 1,
                                name: 1,
                                description: 1
                            },
                        }
                    ],
                    as: "userDetails"
                }
            },
            {
                $lookup: {
                    from: "pages",
                    localField: "referenceId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $addFields: {
                                description: "$tagline"
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                avatar: "$logo",
                                _id: 1,
                                description: 1
                            }
                        }
                    ],
                    as: "pageDetails"
                }
            },
            {
                $lookup: {
                    from: "groups",
                    localField: "referenceId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                avatar: 1,
                                _id: 1,
                                description: 1
                            }
                        }
                    ],
                    as: "groupDetails"
                }
            },
            {
                $lookup: {
                    from: "events",
                    localField: "referenceId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                avatar: "$backgroundImage",
                                _id: 1,
                                description: 1
                            }
                        }
                    ],
                    as: "eventDetails"
                }
            },
            {
                $lookup: {
                    from: "newsletters",
                    localField: "referenceId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                avatar: 1,
                                _id: 1,
                                description: 1
                            }
                        }
                    ],
                    as: "newsletterDetails"
                }
            },
            {
                $addFields: {
                    authorDetails: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$authorType", "user"] },
                                    then: { $arrayElemAt: ["$userDetails", 0] }
                                },
                                {
                                    case: { $eq: ["$authorType", "page"] },
                                    then: { $arrayElemAt: ["$pageDetails", 0] }
                                },
                                {
                                    case: { $eq: ["$authorType", "group"] },
                                    then: { $arrayElemAt: ["$groupDetails", 0] }
                                },
                                {
                                    case: { $eq: ["$authorType", "event"] },
                                    then: { $arrayElemAt: ["$eventDetails", 0] }
                                },
                                {
                                    case: { $eq: ["$authorType", "newsletter"] },
                                    then: { $arrayElemAt: ["$newsletterDetails", 0] }
                                }
                            ],
                            default: null
                        }
                    }
                }
            },
            {
                $project: {
                    like: 0,
                    userDetails: 0,
                    pageDetails: 0,
                    groupDetails: 0,
                    eventDetails: 0,
                    newsletterDetails: 0
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }
        ]);

        const totalDocuments = await Post.aggregate([
            {
                $match: {
                    $or: [
                        { viewPriority: "anyone" },
                        {
                            author: { $in: [...followers, ...following, req.user.id] },
                            viewPriority: "connection"
                        }
                    ]
                }
            },
            {
                $count: "totalDocuments"
            }
        ]);

        if (!post)
            return next(new ErrorHandler("Post not updated Properly!", 400));

        return sendResponse(res, 200, "Post fetched Successfully!", true, {data:post, totalDocuments: totalDocuments[0]?.totalDocuments || 0}, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deletePost = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { postId } = req?.params;

        if (!postId)
            return next(new ErrorHandler("All fields are required", 400));

        const post = await Post.deleteOne({ _id: postId });

        if (!post)
            return next(new ErrorHandler("Post not deleted Properly!", 400));

        return sendResponse(res, 200, "Post deleted Successfully!", true, post, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const createArticle = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { title, description, type, viewPriority, referenceId } = req?.body;
        const path = req?.file?.path;

        if (!title || !description || !type || !viewPriority || !referenceId)
            return next(new ErrorHandler("All fields are required", 400));

        let image = "";

        if (path) {
            const { url } = await uploadOnCloudinary(path, next, {
                transformation: [
                    { width: 1024, height: 1024, crop: "limit" },
                    { quality: "auto:low" },
                    { fetch_format: "auto" }
                ]
            });
            image = url;
        }

        if (path && !image)
            return next(new ErrorHandler("Image not uploaded Properly!", 400));

        const post = await Post.create({ title, description, type, viewPriority, referenceId, image, author: req.user.id });

        if (!post)
            return next(new ErrorHandler("Article not created Properly!", 400));

        if (viewPriority === "connection") {
            const { followers, following } = await User.findById(req.user.id);
            emitEvent(req, next, LOAD_MORE, null, [...followers, ...following]);
        }
        else {
            broadcastEvent(req, next, LOAD_MORE, null);
        }

        return sendResponse(res, 200, "Article created Successfully!", true, post, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editArticle = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { title, description, type, viewPriority, referenceId } = req?.body;
        const path = req?.file?.path;
        const { id } = req?.params;

        if (!title || !description || !type || !viewPriority || !referenceId || !id)
            return next(new ErrorHandler("All fields are required", 400));

        let image = "";

        if (path) {
            const { url } = await uploadOnCloudinary(path, next, {
                transformation: [
                    { width: 1024, height: 1024, crop: "limit" },
                    { quality: "auto:low" },
                    { fetch_format: "auto" }
                ]
            });
            image = url;
        }

        if (path && !image)
            return next(new ErrorHandler("Image not uploaded Properly!", 400));

        let data = { title, description, type, viewPriority, referenceId, author: req.user.id };

        if (image) {
            data = { ...data, image };
        }

        const post = await Post.findByIdAndUpdate(id, data, { new: true });

        if (!post)
            return next(new ErrorHandler("Article not updated Properly!", 400));

        return sendResponse(res, 200, "Article updated Successfully!", true, post, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getArticleByNewsletterId = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));

        const members = await Member.find({ referenceId: id });

        const post = await Post.find({ type: "article", $or: [{ viewPriority: "anyone" }, { author: { $in: [...members, req.user.id] }, viewPriority: "connection" }] });

        if (!post)
            return next(new ErrorHandler("Article not found!", 400));

        return sendResponse(res, 200, "Article fetched Successfully!", true, post, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const listAllPostOfUser = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { page = 1 } = req?.query;
        const limit = 5;
        const { id } = req?.params;
        const { isAuthor = false } = req?.body;

        if (!id)
            return next(new ErrorHandler("All fields are required", 400));

        const post = await Post.aggregate([
            {
                $match:
                    { referenceId: new mongoose.Types.ObjectId(id) },
            },
            {
                $lookup: {
                    from: "likes",
                    let: { postId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$post", "$$postId"] },
                                        { $eq: ["$type", "post"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "like"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    let: { postId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$referenceId", "$$postId"] },
                                        { $eq: ["$isSubComment", false] }
                                    ]
                                },
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                let: { userId: "$owner" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$_id", "$$userId"] },
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            firstName: 1,
                                            lastName: 1,
                                            username: 1,
                                            avatar: 1,
                                            bio: 1,
                                        }
                                    }
                                ],
                                as: "owner"
                            }
                        },
                        {
                            $lookup: {
                                from: "likes",
                                let: { commentId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$post", "$$commentId"] },
                                                    { $eq: ["$type", "comment"] }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: "like"
                            }
                        },
                        {
                            $addFields: {
                                isLike: {
                                    $in: [new mongoose.Types.ObjectId(req.user.id), "$like.owner"]
                                },
                                likeCount: { $size: "$like" }
                            }
                        },
                        {
                            $lookup: {
                                from: "comments",
                                let: { commentId: "$_id" },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    { $eq: ["$parentComment", "$$commentId"] },
                                                ]
                                            }
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: "users",
                                            let: { userId: "$owner" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $and: [
                                                                { $eq: ["$_id", "$$userId"] },
                                                            ]
                                                        }
                                                    }
                                                },
                                                {
                                                    $project: {
                                                        firstName: 1,
                                                        lastName: 1,
                                                        username: 1,
                                                        bio: 1,
                                                        avatar: 1
                                                    }
                                                }
                                            ],
                                            as: "owner"
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: "likes",
                                            let: { commentId: "$_id" },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $and: [
                                                                { $eq: ["$post", "$$commentId"] },
                                                                { $eq: ["$type", "comment"] }
                                                            ]
                                                        }
                                                    }
                                                }
                                            ],
                                            as: "like"
                                        }
                                    },
                                    {
                                        $addFields: {
                                            isLike: {
                                                $in: [new mongoose.Types.ObjectId(req.user.id), "$like.owner"]
                                            },
                                            likeCount: { $size: "$like" },
                                            owner: {
                                                $arrayElemAt: ["$owner", 0]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            like: 0,
                                        }
                                    },
                                ],
                                as: "subComments"
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $arrayElemAt: ["$owner", 0]
                                }
                            }
                        },
                        {
                            $project: {
                                like: 0,
                            }
                        },
                    ],
                    as: "comment"
                }
            },
            {
                $addFields: {
                    likeCount: { $size: "$like" },
                    isLike: {
                        $in: [new mongoose.Types.ObjectId(req.user.id), "$like.owner"]
                    }
                }
            },
            {
                $project: {
                    like: 0,
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }
        ]);

        if (!post)
            return next(new ErrorHandler("Post not found!", 400));

        const totalDocuments = await Post.aggregate([
            {
                $match:{ referenceId: new mongoose.Types.ObjectId(id) },
            },
            {
                $count: "totalDocuments"
            }
        ]);

        return sendResponse(res, 200, "Post fetched Successfully!", true, {data: post, totalDocuments: totalDocuments[0].totalDocuments}, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}


export {
    createPost,
    editPost,
    getAllPostDetails,
    deletePost,
    createArticle,
    editArticle,
    getArticleByNewsletterId,
    listAllPostOfUser
}

