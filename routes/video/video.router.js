import express from 'express'
import mongoose from 'mongoose'
import { checklogin } from '../../middleware/checkligin.middleware.js'
import cloudinary from '../../index.js'
import { Video } from '../../models/video.model.js'
import { User } from '../../models/user.model.js'
import jwt from 'jsonwebtoken'
export const videoRoutes=express.Router()



//logined user can uplaod video from here
videoRoutes.post('/upload',checklogin,async(req,res)=>{
    try {
        const requireheader=req.headers.authorization.split(' ')[1]
        const verifyUser=jwt.verify(requireheader,process.env.JWT_SECRET)
        const uploadedvideo=await cloudinary.v2.uploader.upload(req.files.video.tempFilePath)
        const uploadedthumbnail=await cloudinary.v2.uploader.upload(req.files.thumbnail.tempFilePath)
        //console.log(`uploadedvideo:${uploadedvideo}, uploadedthumbnail:${uploadedthumbnail}`)
        console.log(verifyUser)

        const video=new Video({
             uploadedbyid:verifyUser.userid,
             uploadedbyusername:verifyUser.username,
             title:req.body.title,
             category:req.body.category,
             videoUrl:uploadedvideo.secure_url,
             videopublicid:uploadedvideo.public_id,
             thumbnailUrl:uploadedthumbnail.secure_url,
             thumbnailpublicid:uploadedthumbnail.public_id
         })



        if(req.body.description){
            video.description=req.body.description
        }

        await video.save()
        const user=await User.findById(verifyUser.userid)
        await user.noofvideosuploaded++
        await user.videosuploadedid.push(video._id)
        await user.save()

        res.status(200).json({
            uploadedvideo:uploadedvideo,
            uploadedthumbnail:uploadedthumbnail
        })




    } catch (error) {
        return res.status(500).json({
            ERROR:`ERROR IN VIDEO UPLOAD ROUT ERROR:${error}`
        })
    }
})

//logined user can delete their video from here
videoRoutes.delete('/deletevideo/:videoID',checklogin,async(req,res)=>{
    try {
        const requireheader=req.headers.authorization.split(' ')[1]
        const verifyUser=jwt.verify(requireheader,process.env.JWT_SECRET)
        const video=await Video.findById(req.params.videoID)
         if(verifyUser.userid.toString() !== video.uploadedbyid.toString()){
             return res.status(403).json({
                 ERROR:`YOU ATE NOT ELIGIBLE TO DELETE THIS VIDEO`
             })
         }
        //const video=await Video.findById(req.params.videoID)
        console.log(video)
        const delcloudinaryvideo=await cloudinary.v2.uploader.destroy(video.videopublicid)
        const delcloudinarythumbnail=await cloudinary.v2.uploader.destroy(video.thumbnailpublicid)
        await Video.findByIdAndDelete(req.params.videoID)
        res.status(200).json({
            message:`video deleted successfully`,
            delcloudinarythumbnail:delcloudinarythumbnail,
            delcloudinaryvideo:delcloudinaryvideo,
            video:video
        })
        
        const user=await User.findById(verifyUser.userid)
        await user.noofvideosuploaded--
        user.videosuploadedid= user.videosuploadedid.filter((vid)=>
              vid.toString() !== req.params.videoID
        )
        await user.save()


    } catch (error) {
        return res.status(500).json({
            ERROR:`ERROR IN THE DELETEVIDEO ROUT ERROR:${error.message}`
        })
    }
})



///likes are handeled like this
videoRoutes.put('/like/:videoid',checklogin,async(req,res)=>{
    try {
        const requireheader=req.headers.authorization.split(' ')[1]
        const verifyUser=jwt.verify(requireheader,process.env.JWT_SECRET)
        const video=await Video.findById(req.params.videoid)
        if(video.dislikedbyid.includes(verifyUser.userid)){
            const filterdislikedby=video.dislikedbyid.filter((id)=>
            id.toString()  !== verifyUser.userid.toString()
            )
            video.dislikedbyid=filterdislikedby
            if(video.noofdislikes>0){
            video.noofdislikes--}
        }
        if(video.likedbyid.includes(verifyUser.userid)){
            return res.status(400).json({
                message:`you have alreadyliked this video`
            })
        }
        
        
        video.nooflikes++
        video.likedbyid.push(verifyUser.userid)
        video.likedbyname.push(verifyUser.username)

        await video.save()

    } catch (error) {
        return res.status(500).json({
            error:`error in likes rout ${error.message}`
        })
    }


})



///dislikes is handeled like this[the likedbyname is not getting filtered]
videoRoutes.put('/dislike/:videoid',checklogin,async(req,res)=>{
    try {
        const requireheader=req.headers.authorization.split(' ')[1]
        const verifyUser=jwt.verify(requireheader,process.env.JWT_SECRET)
        const video=await Video.findById(req.params.videoid)
        if(video.likedbyid.includes(verifyUser.userid)){
            const filterlikedby=video.likedbyid.filter((id)=>
            id.toString()  !== verifyUser.userid.toString()
            )
            video.likedbyid=filterlikedby
            if (video.nooflikes>0){
            video.nooflikes--
            }
        }
        if(video.dislikedbyid.includes(verifyUser.userid)){
            return res.status(400).json({
                message:`you have already disliked this video`
            })
        }
        
        video.noofdislikes++
        video.dislikedbyid.push(verifyUser.userid)
        video.dislikedbyname.push(verifyUser.username)

        await video.save()

    } catch (error) {
        return res.status(500).json({
            ERROR:`ERRON IN DISLIKES ROUT ERROR${error.message}`
        })
    }
})


///get all videos
videoRoutes.get('/all',async(req,res)=>{
    const videos=await Video.find()
    res.status(200).json(videos)
})


///get own video
videoRoutes.get("/ownvideo",checklogin,async(req,res)=>{
    try{const requireheader=req.headers.authorization.split(' ')[1]
    const verifyUser=jwt.verify(requireheader,process.env.JWT_SECRET)
    const myvideo=await Video.find({uploadedbyid:verifyUser.userid})
    res.status(200).json(myvideo)
    }catch(error){
        return res.status(500).json({
            ERROR:`ERROR IN GET OWNVIDEO ROUT ${error}`
        })
    }
})