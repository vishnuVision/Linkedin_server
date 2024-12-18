import { Job } from "../../models/page/job.model.js";
import { User } from "../../models/user/user.model.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { sendResponse } from "../../utils/SendResponse.js";
import { Education } from "../../models/user/education.model.js";
import { Experience } from "../../models/user/experience.model.js";
import { Savedjob } from "../../models/page/savedJob.model.js";
import { Types } from "mongoose";
import { Applicant } from "../../models/page/applicant.model.js";

const verfiyJobAccount = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {email} = req?.body;

        if(!email)
            return next(new ErrorHandler("All fields are required", 400));

        const user = await User.findOne({email,_id:req.user.id});

        if(!user)
            return next(new ErrorHandler("User not found", 400));

        user.isJobAccountVerified = true;
        await user.save();

        return sendResponse(res, 200, "Job account verified successfully!", true, user, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const createJob = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {title,company,location,workplaceType,jobType,about,skill,questions,industry} = req?.body;

        if(!title || !company || !location || !workplaceType || !jobType || !about || !skill || !industry)
            return next(new ErrorHandler("All fields are required", 400));

        const user = await User.findById(req.user.id);

        if(!user)
            return next(new ErrorHandler("User not found", 400));

        if(!user.isJobAccountVerified)
            return next(new ErrorHandler("Please verify your job account", 400));

        const job = await Job.create({owner:req.user.id,title,company,location,workplaceType,jobType,about,skill,questions,industry});

        if(!job)
            return next(new ErrorHandler("Job not created properly!", 500));

        return sendResponse(res, 200, "Job created successfully!", true, job, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const updateJob = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const {title,company,location,workplaceType,jobType,about,skill,questions} = req?.body;
        const { id } = req?.params;

        if(!title || !company || !location || !workplaceType || !jobType || !about || !skill || !id)
            return next(new ErrorHandler("All fields are required", 400));

        const job = await Job.findById(id);

        if(!job)
            return next(new ErrorHandler("Job not found", 400));

        if(job.owner.toString() !== req.user.id || job.company.toString() !== req.user.id)
            return next(new ErrorHandler("You are not authorized to update this job", 400));

        const updatedJob = await Job.findByIdAndUpdate(id,{title,company,location,workplaceType,jobType,about,skill,questions},{new:true});

        if(!updatedJob)
            return next(new ErrorHandler("Job not updated properly!", 500));

        return sendResponse(res, 200, "Job updated successfully!", true, updatedJob, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const deleteJob = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if(!id)
            return next(new ErrorHandler("All fields are required", 400));

        const job = await Job.deleteOne({_id:id,$or:[{owner:req.user.id},{company:req.user.id}]});

        if(!job)
            return next(new ErrorHandler("Job not deleted properly!", 500));

        return sendResponse(res, 200, "Job deleted successfully!", true, job, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getSavedJobs = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const savedJobs = await Savedjob.find({user:req.user.id}).populate("job");

        if(!savedJobs)
            return next(new ErrorHandler("Saved jobs not found", 400));

        return sendResponse(res, 200, "Saved jobs fetched successfully!", true, savedJobs, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getPostedJobs = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const postedJobs = await Job.find({owner:req.user.id});

        if(!postedJobs)
            return next(new ErrorHandler("Posted jobs not found", 400));

        return sendResponse(res, 200, "Posted jobs fetched successfully!", true, postedJobs, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getReferenceJobs = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const education = await Education.find({alumini: req.user.id});
        const experience = await Experience.find({emaployee: req.user.id});

        let industry = [];
        let schools = [];
        let companies = [];

        if(education)
        {
            industry = education.map((edu) => edu.fieldOfStudy);
            schools = education.map((edu) => edu._id);
        }

        if(experience)
        {
            companies = experience.map((exp) => exp._id);
        }

        let jobs=[];
        
        if(industry)
        {
            jobs = await Job.find({$or:[{industry: {$in:industry}},{company: {$in:companies}},{company: {$in:schools}}] });
        }
        else
        {
            jobs = await Job.find();
        }

        if(!jobs)
        {
            jobs = await Job.find();
        }

        return sendResponse(res, 200, "Jobs fetched successfully!", true, jobs, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAppliedJob = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const appliedJobs = await Applicant.find({applicant:req.user.id}).populate("job");

        if(!appliedJobs)
            return next(new ErrorHandler("Applied jobs not found", 400));

        return sendResponse(res, 200, "Applied jobs fetched successfully!", true, appliedJobs, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const applyInJob = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { reply=[] } = req?.body;
        const { id } = req?.params;

        if(!id || reply.length === 0)
            return next(new ErrorHandler("All fields are required", 400));

        const job = await Job.findById(id);

        if(!job)
            return next(new ErrorHandler("Job not found", 400));

        const appliedJob = await Applicant.create({applicant:req.user.id,job:id,reply});

        if(!appliedJob)
            return next(new ErrorHandler("Job not applied properly!", 500));

        return sendResponse(res, 200, "Job applied successfully!", true, appliedJob, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const saveJob = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if(!id)
            return next(new ErrorHandler("All fields are required", 400));

        const job = await Savedjob.findOne({job:id,user:req.user.id});

        if(job)
            return next(new ErrorHandler("Job already saved", 400));

        const saveJob = await Savedjob.create({user:req.user.id,job:id});

        if(!saveJob)
            return next(new ErrorHandler("Job not saved properly!", 500));

        return sendResponse(res, 200, "Job saved successfully!", true, saveJob, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

const getAJobDetails = async (req, res, next) => {
    try {
        if (!req.user)
            return next(new ErrorHandler("Please login", 400));

        const { id } = req?.params;

        if(!id)
            return next(new ErrorHandler("All fields are required", 400));

        const job = await Job.findById(id);

        if(!job)
            return next(new ErrorHandler("Job not found!", 500));

        const applicants = await Applicant.countDocuments({job:id})

        return sendResponse(res, 200, "Job fetched successfully!", true, {...job._doc,applicants}, null);
    }
    catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}

export {
    verfiyJobAccount,
    createJob,
    updateJob,
    deleteJob,
    getSavedJobs,
    getPostedJobs,
    getReferenceJobs,
    getAppliedJob,
    applyInJob,
    getAJobDetails,
    saveJob
}



