import mongoose from "mongoose";
import { Schema } from "mongoose";


const commentSchema=new Schema({
       commenttext:{
                type:String
       },
       commentedby:{
                type:Schema.Types.ObjectId,
                ref:"User"
       },
       commentedinvideo:{
              type:Schema.Types.ObjectId,
              ref:"Video"
       }
},{timestamps:true})



export const Comment=mongoose.model("Comment",commentSchema)