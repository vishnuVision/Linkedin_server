import { Router } from "express";
import profileRouter from "./profile.routes.js";
import educationRouter from "./education.routes.js";
import experienceRouter from "./experience.routes.js";
import skillRouter from "./skill.routes.js";

const router = Router();

router.use("/",profileRouter);
router.use("/education",educationRouter);
router.use("/experience",experienceRouter);
router.use("/skill",skillRouter);

export default router;