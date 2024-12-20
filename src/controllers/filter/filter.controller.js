import mongoose from "mongoose";
import { Event } from "../../models/event/event.model.js";
import { Group } from "../../models/group/group.model.js";
import { Newsletter } from "../../models/newsletter/newsletter.model.js";
import { Job } from "../../models/page/job.model.js";
import { Page } from "../../models/page/page.model.js";
import { Post } from "../../models/post/post.model.js";
import { User } from "../../models/user/user.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { sendResponse } from "../../utils/SendResponse.js";

const getSearchQueryFilter = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { text } = req?.params;

        if (!text)
            return next(new ErrorHandler("All fields are required", 400));

        const user = await User.find({ $or: [{ firstName: { $regex: text, $options: "i" } }, { lastName: { $regex: text, $options: "i" } }, { username: { $regex: text, $options: "i" } }] });

        const company = await Page.find({
            name: { $regex: text, $options: "i" },
        });

        if (!user && !company)
            return next(new ErrorHandler("No data found!", 400));

        return sendResponse(res, 200, "data fetched successfully!", true, [...user, ...company], null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllFillterData = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { text } = req?.params;

        if (!text)
            return next(new ErrorHandler("All fields are required", 400));

        const user = await User.find({ $or: [{ firstName: { $regex: text, $options: "i" } }, { lastName: { $regex: text, $options: "i" } }, { username: { $regex: text, $options: "i" } }] });

        const company = await Page.find({
            name: { $regex: text, $options: "i" },
        });

        const { followers, following } = await User.findById(req.user.id);

        const post = await Post.aggregate([
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                { viewPriority: "anyone" },
                                {
                                    $and: [
                                        { author: { $in: [...followers, ...following, req.user.id] } },
                                        { viewPriority: "connection" }
                                    ]
                                }
                            ]
                        },
                        {
                            $or: [
                                { text: { $regex: text, $options: "i" } },
                                { title: { $regex: text, $options: "i" } },
                                { description: { $regex: text, $options: "i" } }
                            ]
                        }
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
                                        $project: {
                                            like: 0,
                                        }
                                    },
                                ],
                                as: "subComments"
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
                    likeCount: { $size: "$like" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    pipeline:[
                        {
                            $addFields:{
                                name: {
                                    $concat: ["$firstName", " ", "$lastName"]
                                },
                                description:"$bio"
                            }
                        },
                        {
                            $project: {
                                avatar: 1,
                                _id: 1,
                                name:1,
                                description:1
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
                    pipeline:[
                        {
                            $addFields: {
                                description:"$tagline"
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                avatar: "$logo",
                                _id: 1,
                                description:1
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
                    pipeline:[
                        {
                            $project: {
                                name: 1,
                                avatar: 1,
                                _id: 1,
                                description:1
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
                    pipeline:[
                        {
                            $project: {
                                name: 1,
                                avatar: "$backgroundImage",
                                _id: 1,
                                description:1
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
                    pipeline:[
                        {
                            $project: {
                                title: 1,
                                avatar: 1,
                                _id: 1,
                                description:1
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
            }
        ]);

        const groups = await Group.aggregate([
            {
                $match: {
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                        { description: { $regex: text, $options: "i" } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "members",
                    localField: "_id",
                    foreignField: "referenceId",
                    as: "members",
                },
            },
            {
                $addFields: {
                    memberCount: { $size: "$members" },
                },
            },
            {
                $project: {
                    members: 0,
                },
            }
        ]);

        const events = await Event.aggregate([
            {
                $match: {
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                        { description: { $regex: text, $options: "i" } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "members",
                    localField: "_id",
                    foreignField: "referenceId",
                    as: "members",
                },
            },
            {
                $addFields: {
                    memberCount: { $size: "$members" },
                },
            },
            {
                $project: {
                    members: 0,
                },
            }
        ]);

        const newsletters = await Newsletter.aggregate([
            {
                $match: {
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                        { description: { $regex: text, $options: "i" } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "members",
                    localField: "_id",
                    foreignField: "referenceId",
                    as: "members",
                },
            },
            {
                $addFields: {
                    memberCount: { $size: "$members" },
                },
            },
            {
                $project: {
                    members: 0,
                },
            }
        ]);

        const jobs = await Job.aggregate([
            {
                $match: {
                    $or: [
                        { title: { $regex: text, $options: "i" } },
                        { description: { $regex: text, $options: "i" } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "applicants",
                    localField: "_id",
                    foreignField: "job",
                    as: "applicants",
                },
            },
            {
                $lookup: {
                    from: "pages",
                    localField: "company",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                _id: 1,
                                logo: 1
                            }
                        }
                    ],
                    as: "company",
                },
            },
            {
                $addFields: {
                    applicantsCount: { $size: "$applicants" },
                },
            },
            {
                $project: {
                    applicants: 0,
                },
            }
        ]);

        if (!user && !company && !post && !groups && !events && !newsletters && !jobs)
            return next(new ErrorHandler("No data found!", 400));

        return sendResponse(res, 200, "user signin successfully!", true, { peoples: [...user], pages: [...company], posts: [...post], groups: [...groups], events: [...events], newsletters: [...newsletters], jobs: [...jobs] }, null);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    getSearchQueryFilter,
    getAllFillterData
}