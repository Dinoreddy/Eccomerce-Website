
import jwt from "jsonwebtoken"
import User from "../models/user.model.js";
export const protectedRoute = async(req,res,next)=>{
    try{
    const accessToken = req.cookies.accessToken;

    if(!accessToken){
        return res.status(401).json({message:"Unauthorized Access token not found!!"})
    }

   try {
    const decoded = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decoded.userId).select("-password");
    

    if(!user){
        return res.status(401).json({message:"User Not Found!!"})
    }

    req.user = user;
    next();
   } catch (error) {
    if(error.name ==="TokenExpiredError"){
        return res.status(401).json({message:"Unauthorized Access token expired"})
    }
    throw(error);
   }
}catch(error){
    console.log("Error in the Protected route controller",error.message);
    return res.status(401).json({message:"Unauthorized invalid access token"})
}

}

export const adminRoute = async(req,res,next)=>{
    try {
        if(req.user.role ==="Admin"){
            
            next();
        }
        
    } catch (error) {
        console.log("error in admin route controller"+error.message)
        return res.status(403).json({message:"User not Authorised to access this route"})
    }
}