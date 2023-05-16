
const  Course = require("../models/Course");
const  Tag = require("../models/Tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
//create course
exports.createCourse = async (req, res)=>{
    try {
        // data fetch 
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;
        //get thumbnail
        const thumbnail = req.files.thumbnailImage;
        //validation for fetch data
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag){
            return res.status(400).json({
                success:false,
                message:"All fields are Required",
            }); 
        }
        //validation for instructor for adding course instructor object ID
        //check instructor details
        const userId = req.User.id;
        const instructorDetails = await User.findById(userId);
        console.log(instructorDetails);

        //validation instructorDetails
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"InstructorDetails Not found",
            }); 
        }
        //check given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"TagDetails Not found",
            });
        }
        //upload Image ti cloyudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //Create an Entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,

        })
        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
                {
                    $push: {
                        courses: newCourse._id,
                    }
                },
                {new:true},
            );

        //update the tag Schema

        //return response
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Faile to create Course",
            error:error.message,
        });
    }
}

//fetch all course