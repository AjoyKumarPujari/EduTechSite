const mongoose = require("mongoose");
const courseSchema =  new mongoose.Schema({
    courseName:{
        type:String,
        require:true,
    },
    courseDescription:{
        type:String,
        require:true,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true,
    },
    whatYouWillLearn:{
        type:String,
        require:true,
    },
    courseContent:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Section",
        }
    ],
    ratingAndReviews: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingsAndReview",
        }
    ],
    price:{
        type:String,
        require:true,
    },
    thumbnail:{
        type:String,
        require:true,
    },
    tag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tag",
    },
    studentsEnrolled:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            require:true,
        }
    ]

});
module.exports = mongoose.model("Course",courseSchema);