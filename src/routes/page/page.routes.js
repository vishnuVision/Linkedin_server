import { Router } from "express";
import { createPage, deactivatePage, editCoverImage, editLogo, editPageDetails, getAllPost, getPageDetails, listAllPageOfUser } from "../../controllers/page/page.controller.js";
import { upload } from "../../middlewares/multer.js"

const pageRouter = Router();

pageRouter.post("/createPage",upload.single("logo"),createPage);
pageRouter.get("/getAllPages",listAllPageOfUser);
pageRouter.get("/getPageDetails/:id",getPageDetails);
pageRouter.put("/editPageDetails/:id",editPageDetails);
pageRouter.delete("/deactivatePage/:id",deactivatePage);
pageRouter.put("/editCoverImage/:id",upload.single("coverImage"),editCoverImage);
pageRouter.put("/editLogo/:id",upload.single("logo"),editLogo);

pageRouter.get("/getAllPost/:id",getAllPost);

export default pageRouter;