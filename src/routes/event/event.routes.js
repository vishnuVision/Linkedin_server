import { Router } from "express";
import { createEvent, deleteEvent, editEvent, getUserEvents, listAllEvent, joinEvent } from "../../controllers/event/event.controller.js";
import { upload } from "../../middlewares/multer.js"

const eventRouter = Router();

eventRouter.get("/",listAllEvent);
eventRouter.get("/getUsersEvent",getUserEvents);
eventRouter.put("/joinEvent/:id",joinEvent);
eventRouter.post("/createEvent",upload.single("backgroundImage"),createEvent);
eventRouter.put("/editEvent/:id",upload.single("backgroundImage"),editEvent);
eventRouter.delete("/deleteEvent/:id",deleteEvent);

export default eventRouter;