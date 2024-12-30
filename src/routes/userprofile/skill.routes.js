import { Router } from "express";
import { createSkill, deleteSkill, editSkill, endorseSkill, getAllSkills } from "../../controllers/userprofile/skill/skill.controller.js";

const skillRouter = Router();

skillRouter.post("/createSkill",createSkill);
skillRouter.put("/editSkill/:id",editSkill);
skillRouter.delete("/deleteSkill/:id",deleteSkill);
skillRouter.get("/getAllSkill/:id",getAllSkills);
skillRouter.put("/endorseSkill/:id",endorseSkill);

export default skillRouter;