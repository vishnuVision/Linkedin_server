import { Router } from "express";
import { createPost, deletePost, editPost, getAllPostDetails } from "../../controllers/post/post.controller.js";
import { upload } from "../../middlewares/multer.js"

const postRouter = Router();

postRouter.get("/getAllPostDetails",getAllPostDetails);
postRouter.post("/createPost",upload.array("media"),createPost);
postRouter.put("/editPost/:postId",editPost);
postRouter.delete("/deletePost/:postId",deletePost);

export default postRouter;