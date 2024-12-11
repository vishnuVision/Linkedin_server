import { ErrorHandler } from "../utils/ErrorHandler.js";
import { validationResult } from "express-validator";

const validationHandler = async (req,res,next) => {
    const errors = validationResult(req);
    let errorMessages = errors.array().map((error)=>error.msg).join(", ")

    if(errors.isEmpty())
        return next();
    else 
        return next(new ErrorHandler(errorMessages,400));
}


export {
    
}