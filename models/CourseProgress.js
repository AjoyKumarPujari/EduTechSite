const mongoose = require("mongoose");
 
const courseProgressSchema = new mongoose.Schema({
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    completedVideos:[
    { 
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subsection",
    }
    ]
}); 

module.exports = mongoose.model("CourseProgress",courseProgressSchema);