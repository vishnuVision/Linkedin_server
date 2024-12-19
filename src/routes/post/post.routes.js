import { Router } from "express";
import { createArticle, createPost, deletePost, editArticle, editPost, getAllPostDetails, getArticleByNewsletterId, listAllPostOfUser } from "../../controllers/post/post.controller.js";
import { upload } from "../../middlewares/multer.js"

const postRouter = Router();

postRouter.get("/getAllPostDetails",getAllPostDetails);
postRouter.get("/listAllPost/:id",listAllPostOfUser);
postRouter.get("/getArticleByNewsletterId/:id",getArticleByNewsletterId);
postRouter.post("/createPost",upload.array("media"),createPost);
postRouter.put("/editPost/:postId",editPost);
postRouter.delete("/deletePost/:postId",deletePost);
postRouter.post("/createArticle",upload.single("image"),createArticle);
postRouter.put("/editArticle/:id",upload.single("image"),editArticle);

export default postRouter;