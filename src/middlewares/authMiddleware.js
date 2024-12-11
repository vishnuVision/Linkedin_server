import jwt from "jsonwebtoken";

const authMiddleware = async (req,res,next) => {
    const {userToken} = req.cookies;

    if(!userToken)
        return res.status(401).json({success:false,message:"Please login as Admin"});

    const user = await jwt.verify(userToken,process.env.JWT_SECRET);

    if(!user)
        return res.status(401).json({success:false,message:"Admin Not Found"});

    req.user = user;
    next();
}

export {
    authMiddleware,
}