import { Router } from "express";
import { addLike, getAllReactedUser, removeLike } from "../../controllers/post/like.controller.js";

const likeRouter = Router();

likeRouter.post("/addLike/:postId",addLike);
likeRouter.delete("/removeLike/:postId",removeLike);
likeRouter.get("/getAllReactedUser/:postId",getAllReactedUser);

export default likeRouter;