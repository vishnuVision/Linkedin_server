import { ErrorHandler } from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";

const socketAuthenticator = async (err, socket, next) => {
    try {
        if (err)
            return next(new ErrorHandler(err, 400));

        const token = await socket?.request?.headers?.cookie;

        if (!token)
            return next(new ErrorHandler("Token is required", 400));

        const user = await jwt.verify(token, process.env.JWT_SECRET);

        if (!user)
            return next(new ErrorHandler("Token is invalid", 400));
        socket.user = user;
        next();
        
    } catch (error) {
        return next(new ErrorHandler(error, 500));
    }
}

export {
    socketAuthenticator
}