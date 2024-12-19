import { Router } from "express";
import { getAllCatchup } from "../../controllers/catchup/catchup.controller.js";

const catchupRouter = Router();

catchupRouter.get("/",getAllCatchup);

export default catchupRouter;