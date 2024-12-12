import { Router } from "express";
import { getUserDetails, login, logout, register } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/register",register);
authRouter.post("/login",login);

authRouter.use(authMiddleware);
authRouter.get("/getUserDetails",getUserDetails);
authRouter.delete("/logout",logout)

export default authRouter;