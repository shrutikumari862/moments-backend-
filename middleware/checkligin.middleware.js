import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'

export const checklogin=(req,res,next)=>{
   try{ 
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "No token provided" });
    }
    const requireheader=req.headers.authorization.split(' ')[1]
    const verifyUser=jwt.verify(requireheader,process.env.JWT_SECRET)
    next()
}catch(error){
    return res.status(500).json({
        ERROR:`ERRON IN CHECKLOGIN MIDDLEWARE ERROR:${error}`
    })
}
}



