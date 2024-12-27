import { Router } from "express";
import { addComment, addSubComment, deleteComment, EditComment, getAllComment } from "../../controllers/post/comment.controller.js";
import { upload } from "../../middlewares/multer.js";

const commentRouter = Router();

commentRouter.post("/addComment/:postId",upload.single("media"),addComment);
commentRouter.put("/editComment/:postId/:id",EditComment);
commentRouter.delete("/deleteComment/:postId/:id",deleteComment);
commentRouter.get("/getAllComment/:postId",getAllComment);

commentRouter.post("/addSubComment/:postId/:commentId",upload.single("media"),addSubComment);

export default commentRouter;