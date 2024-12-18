import {  Router } from "express";
import { applyInJob, createJob, deleteJob, getAJobDetails, getAppliedJob, getPostedJobs, getReferenceJobs, getSavedJobs, saveJob, updateJob, verfiyJobAccount } from "../../controllers/job/job.controller.js";

const jobRouter = Router();

jobRouter.get("/",getReferenceJobs);
jobRouter.put("/verfiyJobAccount",verfiyJobAccount);
jobRouter.get("/getSavedJobs",getSavedJobs);
jobRouter.get("/getPostedJobs",getPostedJobs);
jobRouter.get("/getAppliedJobs",getAppliedJob);
jobRouter.get("/getAJobDetails/:id",getAJobDetails);
jobRouter.post("/createJob",createJob);
jobRouter.put("/updateJob/:id",updateJob);
jobRouter.delete("/deleteJob/:id",deleteJob);
jobRouter.put("/applyInJob/:id",applyInJob);
jobRouter.put("/saveJob/:id",saveJob);

export default jobRouter;