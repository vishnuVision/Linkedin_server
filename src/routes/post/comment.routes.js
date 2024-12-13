import { Router } from "express";
import { addComment, deleteComment, EditComment, getAllComment } from "../../controllers/post/comment.controller.js";
import { upload } from "../../middlewares/multer.js";

const commentRouter = Router();

commentRouter.post("/addComment/:postId",upload.single("media"),addComment);
commentRouter.put("/editComment/:id",EditComment);
commentRouter.delete("/deleteComment/:id",deleteComment);
commentRouter.get("/getAllComment/:postId",getAllComment);

export default commentRouter;