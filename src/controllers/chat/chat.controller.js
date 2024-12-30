import { Chat } from "../../models/chat/chat.model.js";
import { Message } from "../../models/chat/message.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { sendResponse } from "../../utils/SendResponse.js";

const sendMessage = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        if(!req?.body)
            return next(new ErrorHandler("All fields are required", 400));

        if(!req?.files)
            return next(new ErrorHandler("All fields are required", 400));

        const { content="",receiver,chatId } = req.body;
        const files = req.files || [];

        if(!receiver || (!content && files.length === 0))
            return next(new ErrorHandler("All fields are required", 400));

        let media = [];
        if (files.length > 0) {
            const uploadFilesOnCloudinaryPromise = await Promise.all(files.map(async (file) => {
                try {
                    const { url } = await uploadOnCloudinary(file.path, next, {
                        transformation: [
                            { width: 1024, height: 1024, crop: "limit" },
                            { quality: "auto:low" },
                            { fetch_format: "auto" }
                        ]
                    });
                    return url ;
                } catch (error) {
                    return next(new ErrorHandler(error.message, 500));
                }
            }))
            media = uploadFilesOnCloudinaryPromise;
        }

        let message;

        if(chatId)
        {
            message = await Message.create({
                content,
                attachments:media,
                sender: req.user.id,
                chat: chatId
            });
        }
        else
        {
            const chat = await Chat.findOne({members: { $all: [req.user.id, receiver] }})

            if(chat)
            {
                message = await Message.create({
                    content,
                    attachments:media,
                    sender: req.user.id,
                    chat: chat._id
                });
            }
            else
            {
                const newChat = await Chat.create({creator: req.user.id,members: [req.user.id, receiver]});

                message = await Message.create({
                    content,
                    attachments:media,
                    sender: req.user.id,
                    chat: newChat._id
                });
            }
        }

        if(!message)
            return next(new ErrorHandler("Something went wrong", 500));

        return sendResponse(res, 200, "Message sent successfully!", true, message, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const editMessage = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;
        const { content } = req?.body;

        if(!id || !content)
            return next(new ErrorHandler("All fields are required", 400));

        const editMessage = await Message.findOneAndUpdate({ _id: id, sender: req.user.id }, { content },{new: true});

        if(!editMessage)
            return next(new ErrorHandler("Message not updated", 500));

        return sendResponse(res, 200, "Message updated successfully!", true, editMessage, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteMessage = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if(!id)
            return next(new ErrorHandler("All fields are required", 400));

        const message = await Message.findOneAndDelete({ _id: id, sender: req.user.id });

        if(!message)
            return next(new ErrorHandler("Message not deleted", 500));

        return sendResponse(res, 200, "Message deleted successfully!", true, editMessage, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const listAllChat = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const chat = await Chat.find({members: {$in:req.user.id}}).populate("members","_id avatar firstName lastName");

        if(!chat)
            return next(new ErrorHandler("Chat not found", 500));

        return sendResponse(res, 200, "Chat fetched Successfully!", true, chat, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAllMessageofChat = async (req,res,next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if(!id)
            return next(new ErrorHandler("All fields are required", 400));

        const messages = await Message.find({chat:id}).populate("sender","avatar firstName lastName");

        if(!messages)
            return next(new ErrorHandler("Messages not found", 500));

        return sendResponse(res, 200, "Messages fetched Successfully!", true, messages, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    sendMessage,
    listAllChat,
    getAllMessageofChat,
    deleteMessage,
    editMessage
}