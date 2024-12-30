import { Router } from "express";
import { createEducation, deleteEducation, editEducation, getAllEducations } from "../../controllers/userprofile/education/education.controller.js";
import { upload } from "../../middlewares/multer.js"

const educationRouter = Router();

educationRouter.get("/:id",getAllEducations);
educationRouter.post("/createEducation",upload.array("media",5),createEducation);
educationRouter.put("/editEducation/:id",upload.array("media",5),editEducation);
educationRouter.delete("/deleteEducation/:id",deleteEducation);

export default educationRouter;