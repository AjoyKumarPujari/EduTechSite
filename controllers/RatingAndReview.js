const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

//create Rating
exports.createRating = async (req, res)=>{
    try {
        //get user id
        const userId = req.user.id//from login
        //fetch user id from request body
        const{ratings, review, CourseId} = req.body;
        //check if user is enrolled or not
        const courseDetails = await Course.findOne(
                                            {_id:CourseId,
                                                studentsEnrolled:{$elementMatch: {$eq: userId}},
                                            });
        if(!courseDetails) {
            return res.status(404).json({
                success:false,
                message:"Student Is not Enrolled in this Course",
                error:error.message,
            });
        }
        //user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
                                                        user: userId,
                                                        course: CourseId,
        });
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is Already Reviewed by the user",
                error:error.message,
            });
        }
        //create review and rating
        const ratingReview = await RatingAndReview.create({
                                    rating, review,
                                    course:CourseId,
                                    user:userId
                                });
        //update course with rating and review
        const updatedCourseDetail = await Course.findByIdAndUpdate({_id:CourseId},
                                        {
                                            $push: {
                                            RatingAndReview:ratingReview._id,
                                            }
                                        },{new:true});
        console.log(updatedCourseDetail);                
        //return response
        return res.status(200).json({
            success:true,
            message:"Return and Review added successfully",
            ratingReview,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Return and Review added successfully",
            message:error.message,
        });
    }
}
//getaverage Rating

//get All rating