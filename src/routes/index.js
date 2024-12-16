import { Router } from "express";
import authRouter from "./auth/auth.routes.js";
import postRouter from "./post/index.js";
import pageRouter from "./page/index.js";
import userProfileRouter from "./userprofile/index.js";

const router = Router();

router.use("/",authRouter);
router.use("/post",postRouter);
router.use("/page",pageRouter);
router.use("/profile",userProfileRouter);

export default router;