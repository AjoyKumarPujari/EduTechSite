
const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//create course
exports.createCourse = async (req, res)=>{
    try {
        //get usr
        const userId = req.user.id; 
        const thumbnail = req.files.thumbnailImage;
        let {
            courseName, 
            courseDescription, 
            whatYouWillLearn, 
            price, 
            tag,
            category,
            status,
            instructions,
        } = req.body;

        console.log(courseName);
        console.log(courseDescription);
        console.log(whatYouWillLearn);
        console.log(price);
        console.log(tag);
        console.log(category);
        console.log(status);
        console.log(instructions);
        //get thumbnail
        
      // console.log(thumbnail);
        //validation for fetch data
        if(
            !courseName || 
            !courseDescription || 
            !whatYouWillLearn || 
            !price || 
            !tag ||
            !category||
            !thumbnail
           
            
            ){
            return res.status(400).json({
                success:false,
                message:"All fields are Required",
            }); 
        }

        if(!status || status === undefined){
            status = "Draft";
        }
        //validation for instructor for adding course instructor object ID
        //check instructor details
        const instructorDetails = await User.findById(userId,{
            accountType: "Instructor",
        });
        console.log(instructorDetails);

        //validation instructorDetails
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"InstructorDetails Not found",
            }); 
        }
        //check given tag is valid or not
        const categorydetails  = await Category.findById(category);
        if(!categorydetails){
            return res.status(404).json({
                success:false,
                message:"categorydetails Not found",
            });
        }
        //upload Image ti cloyudinary
        const thumbnailImage = await uploadImageToCloudinary(
            thumbnail, 
            process.env.FOLDER_NAME,
            1000,
            1000
            )
       
        //Create an Entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            tag: tag,
            category: categorydetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
			instructions: instructions,

        })
        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {
                _id:instructorDetails._id
            },
                {
                    $push: {
                        courses: newCourse._id,
                        
                    },
                },
                {new:true}
            );

        //update the tag Schema
        // Add the new course to the Categories
		await Category.findByIdAndUpdate(
			{ _id: category },
			{
				$push: {
					course: newCourse._id,
				},
			},
			{ new: true }
		);
        //return response
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Faile to create Course",
            error:error.message,
        });
    }
}

//fetch all course

exports.showAllCourses=async(req, res) => {
    try {
        const allCourses = await Course.find({}, {courseName:true, price:true, thumbnail:true, instructor:true, ratingAndReviews:true, studentsEnrolled:true,}).populate("instructor").exec();
        console.log(allCourses);
        return res.status(200).json({
            success:true,
            message:"Data for all Courses fetch Successfully",
           data:allCourses,
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to Get Course Details",
            error:error.message,
        });
    }
}


//get all courses//getCourseDetails
exports.getCourseDetails = async (req, res) => {
    try {
            //get id
            const {courseId} = req.body;
            //find course details
            const courseDetails = await Course.find(
                                        {_id:courseId})
                                        .populate(
                                            {
                                                path:"instructor",
                                                populate:{
                                                    path:"additionalDetails",
                                                },
                                            }
                                        )
                                        .populate("category")
                                        //.populate("ratingAndreviews")
                                        .populate({
                                            path:"courseContent",
                                            populate:{
                                                path:"subSection",
                                            },
                                        })
                                        .exec();

                //validation
                if(!courseDetails) {
                    return res.status(400).json({
                        success:false,
                        message:`Could not find the course with ${courseId}`,
                    });
                }
                //return response
                return res.status(200).json({
                    success:true,
                    message:"Course Details fetched successfully",
                    data:courseDetails,
                })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}