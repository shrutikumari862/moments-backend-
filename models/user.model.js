import mongoose from "mongoose";
import {Schema} from 'mongoose'

const userSchema=new Schema({
    username:{
        type:String,
        required:true,

    },
    password:{
         type:String,
         required:true,
    },
    phone:{
         type:String,
         required:true,
    },
    email:{
         type:String,
         required:true,
         unique:true
    },
    profilepicture:{
            type:String,
            default:null
    },
    profilepicturepublicid:{
        type:String,
        default:null
    },
    dateofbirth:{
        type:Date
    },
    gender:{
        type:String,
        enum:["Male","Female","Other"]
    },
    city:{
        type:String,
    },
    country:{
        type:String,
    },
    videosuploadedid:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    noofvideosuploaded:{
        type:Number,
        default:0
    },
    videosliked:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    noofvideosliked:{
        type:Number,
        default:0
    },
    videosdisliked:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    noofvideosdisliked:{
        type:Number,
        default:0
    },
    followersname:[{
        type:String,
        
    }],
    followersid:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
    nooffollowers:{
        type:Number,
        default:0
    },

    followingid:[{
        type:Schema.Types.ObjectId,
        ref:"User"
    }],
    followingname:[{
          type:String,
    }],
    nooffollowing:{
        type:Number,
        default:0
    }
},{timestamps:true})


export const User=mongoose.model("User",userSchema)