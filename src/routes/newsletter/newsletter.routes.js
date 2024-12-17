import { Router } from "express";
import { createNewsletter, deleteNewsletter, editNewsletter, listAllNewsletter,getUserNewsLetters, followNewsletter } from "../../controllers/newsletter/newsletter.controller.js";
import { upload } from "../../middlewares/multer.js"

const newsLetterRouter = Router();

newsLetterRouter.get("/",listAllNewsletter);
newsLetterRouter.get("/getAdminNewsletter",getUserNewsLetters);
newsLetterRouter.post("/createNewsletter",upload.single("avatar"),createNewsletter);
newsLetterRouter.put("/editNewsletter/:id",upload.single("avatar"),editNewsletter);
newsLetterRouter.delete("/deleteNewsletter/:id",deleteNewsletter);
newsLetterRouter.put("/followNewsletter/:id",followNewsletter);

export default newsLetterRouter;