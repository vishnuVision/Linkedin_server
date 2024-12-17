import { Router } from "express";
import { createGroup, deleteGroup, editGroup, getAdminGroup, joinGroup, listAllGroup } from "../../controllers/group/group.controller.js";
import { upload } from "../../middlewares/multer.js"

const groupRouter = Router();

groupRouter.get("/",listAllGroup);
groupRouter.get("/getUsersGroup",getAdminGroup);
groupRouter.put("/joinGroup/:id",joinGroup);
groupRouter.post("/createGroup",upload.fields([{ name: "avatar", maxCount: 1 }, { name: "backgroundImage", maxCount: 1 }]),createGroup);
groupRouter.put("/editGroup/:id",upload.fields([{ name: "avatar", maxCount: 1 }, { name: "backgroundImage", maxCount: 1 }]),editGroup);
groupRouter.delete("/deleteGroup/:id",deleteGroup);

export default groupRouter;