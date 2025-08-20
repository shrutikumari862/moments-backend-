import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { checklogin } from '../../middleware/checkligin.middleware.js'
import { User } from '../../models/user.model.js'
import cloudinary from '../../index.js'
export const userRouter=express.Router()
dotenv.config()
     
  //////USER CAN SIGN UP LIKE THIS   
userRouter.post('/signup',async(req,res)=>{
     //console.log("REQ.BODY:", req.body);

      const registeredUser=await User.find({email:req.body.email}) 
      if(registeredUser.length>0){ 
        return res.status(500).json({ 
            ERROR:`THIS EMAIL IS ALREADY REGISTERED NO NEED TO REGISTER AGAIN JUST LOGIN WITH THIS EMAIL` 
        }) } 

        let uploadedprofilepicture=null
         if(req.files && req.files.profilepicture){
         uploadedprofilepicture=await cloudinary.v2.uploader.upload(req.files.profilepicture.tempFilePath)
         console.log(uploadedprofilepicture) }
         
         const hashedPassword=await bcrypt.hash(req.body.password,10) 
         console.log(hashedPassword) 
         const user=new User({ 
            username:req.body.username, 
            password:hashedPassword, 
            email:req.body.email, 
            phone:req.body.phone, 
            
            })
            
            if(uploadedprofilepicture){
                user.profilepicture=uploadedprofilepicture.secure_url;
                user.profilepicturepublicid=uploadedprofilepicture.public_id
                 }
             const newuser=await user.save()
             res.status(200).json({
                 newUser:newuser 
                })
             })

///////USER CAN LOGIN 
userRouter.post("/login",async(req,res)=>{
          try{const verifyemail=await User.find({email:req.body.email})
          if(!verifyemail || verifyemail.length==0){
             return res.status(500).json({
                message:`this user is not registered, please signup first`
            })
          }
           const verifypassword=await bcrypt.compare(req.body.password,verifyemail[0].password)
         if(!verifypassword){
             return res.status(500).json({
                message:`the password you entered is wrong, please recheck`
            })
         }
         console.log(verifyemail)
         
        
         
         const token=jwt.sign({
            userid:verifyemail[0]._id,
            username:verifyemail[0].username,
            email:verifyemail[0].email,
         },process.env.JWT_SECRET)

         res.status(200).json({
            message:'login successful',
            token:token
         })
        }catch(error){
            return res.status(500).json({
                ERROR:`ERROR IN LOGIN ERROR:${error}`
            })
        }



})             

////USER CAN DETETE [ONLY] THEIR [OWN] ACCOUNT FROM HERE
userRouter.delete('/deleteuser/:userID',checklogin,async(req,res)=>{

    const requireheader=req.headers.authorization.split(' ')[1]
    const verifyUser=jwt.verify(requireheader,process.env.JWT_SECRET)
    //const userID=req.params.userID
    const user=await User.findById(req.params.userID)
    if(verifyUser.userid==user._id){
    if(user.profilepicture && user.profilepicturepublicid){
        await cloudinary.v2.uploader.destroy(user.profilepicturepublicid)
    }


    const deletedUser=await User.findByIdAndDelete(req.params.userID)
    if(!deletedUser){
        return res.status(500).json({
            ERROR:`user not found`
        })
    }
   res.status(200).json({
    deletedUser:deletedUser
    })
 }
})             



///followers and following is handeled from here
//the one who is following= userA
//the one who is being followed =userB
userRouter.put("/follow/:userBid",checklogin,async(req,res)=>{
    try {
        const requireheader=req.headers.authorization.split(' ')[1]
        const verifyUser=jwt.verify(requireheader,process.env.JWT_SECRET)
        console.log(verifyUser)
        const userB=await User.findById(req.params.userBid)
        const userA=await User.findById(verifyUser.userid)
        if(userB.followersid.includes(verifyUser.userid)){
            return res.status(400).json({
                message:`you are already following this user`
            })
        }
        await userB.followersname.push(verifyUser.username)
        await userB.followersid.push(verifyUser.userid)
        await userB.nooffollowers++

        await userB.save()


        await userA.followingname.push(userB.username)
        await userA.followingid.push(userB._id)
        await userA.nooffollowing++
        
        await userA.save()

    } catch (error) {
        return res.status(500).json({
            ERROR:`ERROR IN /FOLLOE ROUT ERROR:${error.message}`
        })
        
    }
})