import { Router } from "express";
import { getAllFillterData, getSearchQueryFilter } from "../../controllers/filter/filter.controller.js";

const filterRouter = Router();

filterRouter.get("/:text",getSearchQueryFilter);
filterRouter.get("/getAllData/:text",getAllFillterData);

export default filterRouter;