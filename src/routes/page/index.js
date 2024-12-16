import { Router } from "express";
import pageRouter from "./page.routes.js";

const router = Router();

router.use("/",pageRouter);

export default router;