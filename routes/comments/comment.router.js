import express from 'express'
import { checklogin } from '../../middleware/checkligin.middleware.js'
import { Comment } from '../../models/comment.model.js'
export const commentRout=express.Router()



commentRout.post("/comment/:videoid",checklogin,async(req,res)=>{
    try {
        
        const requireheader=req.headers.authorization.split(' ')[1]
        const verifyUser=jwt.verify(requireheader,process.env.JWT_SECRET)
        const comment=new Comment({
            commenttext:req.body.comment,
            commentedby:verifyUser.userid,
            commentedinvideo:req.params.videoid
        })
        await comment.save()



    } catch (error) {
        return res.status(500).json({
            ERROR:`ERROR IN COMMENT ROUTE ERROR:${error.message}`
        })
    }
})



commentRout.delete("/delete/:commentid",checklogin,async(req,res)=>{
    try {
        const requireheader=req.headers.authorization.split(' ')[1]
        const verifyUser=jwt.verify(requireheader,process.env.JWT_SECRET)
        const comment=await Comment.findById(req.params.commentid)
        if(verifyUser.userid.toString() !== comment.commentedby.toString()){
            return res.status(400).json({
                message:'you are not eligible to delete this comment'
            })
        }
        const delcomment=await Comment.findByIdAndDelete(req.params.commentid)
        
        
    } catch (error) {
        return res.status(500).json({
            ERROR:`ERROR IN COMMENT DELETE ROUT ${error}`
        })
    }
})