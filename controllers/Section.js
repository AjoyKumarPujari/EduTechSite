const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req, res) => {
    try {
        //data fetch
        const {sectionName, courseId} = req.body;
        //data valiodation
        if(!sectionName|| ! courseId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        // Section Create
        const newSeection = await Section.create({sectionName});
        //update Course with Section ObjectID
         const updatedCourseDetails = await Course.findByIdAndUpdate(
                                                                courseId,
                                                                {
                                                                    $push:{
                                                                        courseContent: newSeection._id,
                                                                    }
                                                                },
                                                                {new:true},
                                                            )
        //return response
        return res.status(200).json({
            success:true,
            message:"Section Created",
            updatedCourseDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:"Unable to Create Section ",
            error:error.message,
        });
    }
} 