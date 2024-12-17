import { Router } from "express";
import { editAbout, editAvatarImage, editBackgroundImage, editContactInformation, editProfile } from "../../controllers/userprofile/profile/profile.controller.js";
import { upload } from "../../middlewares/multer.js"

const profileRouter = Router();

profileRouter.put("/editProfile",editProfile);
profileRouter.put("/editContactInfomation",editContactInformation);
profileRouter.put("/editBackgroundImage",upload.single("backgroundImage"),editBackgroundImage);
profileRouter.put("/editAvatar",upload.single("avatar"),editAvatarImage);
profileRouter.put("/editAbout",editAbout);

export default profileRouter;