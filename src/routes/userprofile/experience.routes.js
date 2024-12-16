import { Router } from "express";
import { createExperience, deleteExperience, editExperience, getAllExperiences } from "../../controllers/userprofile/experience/experience.controller.js";
import { upload } from "../../middlewares/multer.js"

const experienceRouter = Router();

experienceRouter.get("/",getAllExperiences);
experienceRouter.post("/createExperience",upload.array("media",5),createExperience);
experienceRouter.put("/editExperience/:id",upload.array("media",5),editExperience);
experienceRouter.delete("/deleteExperience/:id",deleteExperience);    

export default experienceRouter;