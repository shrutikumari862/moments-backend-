import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const videoSchema=new Schema({
       uploadedbyid:{
              type:Schema.Types.ObjectId,
              ref:'User',
              required:true
       },
       uploadedbyusername:{
              type:String,
              required:true
       },
       title:{
              type:String,
              required:true
       },
       category:{
                type:String,
                enum:["Music","Dance","Comedy","Education","Gaming","Sports","News","Techonology","Lifestyle","Travel","Food","Fashion","Art","Other"],
                required:true
       },
       description:{
                type:String
       },
       videoUrl:{
                type:String,
                required:true
       },
       thumbnailUrl:{
                type:String,
                required:true
       },
       thumbnailpublicid:{
                type:String,
                required:true
       },
       videopublicid:{
                type:String,
                required:true
},
       likedbyid:[{
                type:Schema.Types.ObjectId,
                ref:"User"
       }],
       likedbyname:[{
              type:String
       }],
       dislikedbyid:[{
                type:Schema.Types.ObjectId,
                ref:"User"
       }],
       dislikedbyname:[{
              type:String
       }],
       nooflikes:{
                type:Number,
                default:0

       },
       noofdislikes:{
                type:Number,
                default:0
       },
      
       noofcomments:{
                 type:Number,
                 default:0
       },


},
{timestamps:true}
)











export const Video=mongoose.model("Video",videoSchema)