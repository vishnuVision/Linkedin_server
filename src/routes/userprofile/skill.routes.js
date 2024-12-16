import { Router } from "express";
import { createSkill, deleteSkill, editSkill, getAllSkills } from "../../controllers/userprofile/skill/skill.controller.js";

const skillRouter = Router();

skillRouter.post("/createSkill",createSkill);
skillRouter.put("/editSkill/:id",editSkill);
skillRouter.delete("/deleteSkill/:id",deleteSkill);
skillRouter.get("/getAllSkill",getAllSkills);

export default skillRouter;