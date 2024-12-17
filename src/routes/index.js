import { Router } from "express";
import authRouter from "./auth/auth.routes.js";
import postRouter from "./post/index.js";
import pageRouter from "./page/index.js";
import userProfileRouter from "./userprofile/index.js";
import groupRouter from "./group/group.routes.js";
import eventRouter from "./event/event.routes.js";
import newsLetterRouter from "./newsletter/newsletter.routes.js";

const router = Router();

router.use("/",authRouter);
router.use("/post",postRouter);
router.use("/page",pageRouter);
router.use("/profile",userProfileRouter);
router.use("/group",groupRouter);
router.use("/event",eventRouter);
router.use("/newsletter",newsLetterRouter);

export default router;