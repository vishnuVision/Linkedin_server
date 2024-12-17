import { Router } from "express";
import postRouter from "./post.routes.js";
import likeRouter from "./like.routes.js";
import commentRouter from "./comment.routes.js";

const router = Router();

router.use("/",postRouter);
router.use("/like",likeRouter);
router.use("/comment",commentRouter);

export default router;