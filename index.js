import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import { userRouter } from './routes/user/user.router.js'
import cloudinary from 'cloudinary'

import dotenv from 'dotenv'
import fileUpload from 'express-fileupload'
import { videoRoutes } from './routes/video/video.router.js'
import { commentRout } from './routes/comments/comment.router.js'
export const env=dotenv.config()

const app=express()

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
export default cloudinary


const mongoDbconnection=async()=>{
    try {
        const connection=await mongoose.connect(process.env.MONGODB_URI)
        console.log(`CONNECTION WITH MONGODB SUCCESSFUL`)

    } catch (error) {
        console.log(`ERROR IN CONNECTION WITH DB ERROR:${error}`)
    }
}

mongoDbconnection()
//app.use(express.json()); // ✅ handles JSON requests
//app.use(express.urlencoded({ extended: true })); // ✅ handles form data
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));
app.use(bodyParser.json());

app.use('/user',userRouter)
app.use('/video',videoRoutes)
app.use('/comment',commentRout)








app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})