import jwt from "jsonwebtoken";

const authMiddleware = async (req,res,next) => {
    const {userToken} = req.cookies;

    if(!userToken)
        return res.status(401).json({success:false,message:"Please login"});

    const user = await jwt.verify(userToken,process.env.JWT_SECRET);

    if(!user)
        return res.status(401).json({success:false,message:"User not found!"});

    req.user = user;
    next();
}

export {
    authMiddleware,
}