import { Router } from "express";
import authRouter from "./auth/auth.routes.js";
import postRouter from "./post/index.js";
import pageRouter from "./page/index.js";
import userProfileRouter from "./userprofile/index.js";
import groupRouter from "./group/group.routes.js";
import eventRouter from "./event/event.routes.js";
import newsLetterRouter from "./newsletter/newsletter.routes.js";
import jobRouter from "./job/job.routes.js";
import friendRequestRouter from "./friendRequest/sendFriendRequest.js";
import chatRouter from "./chat/chat.routes.js";
import catchupRouter from "./catchup/catchup.routes.js";
import filterRouter from "./filter/filter.routes.js";

const router = Router();

router.use("/",authRouter);
router.use("/post",postRouter);
router.use("/page",pageRouter);
router.use("/profile",userProfileRouter);
router.use("/group",groupRouter);
router.use("/event",eventRouter);
router.use("/newsletter",newsLetterRouter);
router.use("/job",jobRouter);
router.use("/friendRequest",friendRequestRouter);
router.use("/chat",chatRouter);
router.use("/catchup",catchupRouter);
router.use("/filter",filterRouter)

export default router;