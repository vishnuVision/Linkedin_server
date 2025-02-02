import { Router } from "express";
import { addReuiredDetails, getAllPages, getProfile, getUserDetails, login, logout, register } from "../../controllers/auth/auth.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const authRouter = Router();

authRouter.post("/register",register);
authRouter.post("/login",login);
authRouter.get("/getAllPages/:type",getAllPages);

authRouter.use(authMiddleware);
authRouter.put("/updateUserRequiredDetails",addReuiredDetails);
authRouter.get("/getUserDetails",getUserDetails);
authRouter.get("/profile/:id",getProfile);
authRouter.delete("/logout",logout)

export default authRouter;