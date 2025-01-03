import { Router } from "express";
import { createSkill, deleteSkill, editSkill, endorseSkill, getAllSkills, getAllSkillsForDropdown } from "../../controllers/userprofile/skill/skill.controller.js";
import { updateSkillIsTop } from "../../controllers/userprofile/profile/profile.controller.js";

const skillRouter = Router();

skillRouter.post("/createSkill",createSkill);
skillRouter.put("/editSkill/:id",editSkill);
skillRouter.delete("/deleteSkill/:id",deleteSkill);
skillRouter.get("/getAllSkill/:id",getAllSkills);
skillRouter.put("/endorseSkill/:id",endorseSkill);
skillRouter.put("/updateSkill/:id",updateSkillIsTop);
skillRouter.get("/getAllSkill",getAllSkillsForDropdown);

export default skillRouter;