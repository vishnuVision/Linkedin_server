import { Router } from "express";
import { deleteMessage, editMessage, getAllMessageofChat, listAllChat, sendMessage } from "../../controllers/chat/chat.controller.js";
import { upload } from "../../middlewares/multer.js";

const chatRouter = Router();

chatRouter.get("/",listAllChat);
chatRouter.get("/getChatMessages/:id",getAllMessageofChat);
chatRouter.delete("/deleteMessage/:id",deleteMessage);
chatRouter.put("/editMessage/:id",editMessage);
chatRouter.post("/sendMessage",upload.array("attachments"),sendMessage);

export default chatRouter;