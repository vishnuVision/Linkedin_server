import { Router } from "express";
import authRouter from "./auth/auth.routes.js";
import postRouter from "./post/index.js";

const router = Router();

router.use("/",authRouter);
router.use("/post",postRouter);

export default router;