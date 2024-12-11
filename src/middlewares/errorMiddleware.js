const errorMiddleware = (err, req, res, next) => {
    err.statusCode ||= 500;
    err.message ||= "Something went wrong";

    return res
    .status(err.statusCode)
    .json({
        success:false,
        message: err.message
    });
}

export {    
    errorMiddleware
}