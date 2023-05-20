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
};

exports.updateSection = async (req, res) => {
    try {
        //data input
        const {sectionName, sectionId} = req.body
        //validation
        if(!sectionName|| ! sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing Properties",
            });
        }
        //update data by ID
        const UpdateSection = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        //return  response
        return res.status(200).json({
            success:true,
            message:"Section Updated",
            UpdateSection,
        });
        
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:"Unable to Update Section, Please try again ",
            error:error.message,
        });
    }
}


exports.deleteSection = async (req, res)=> {
    try {
        //get ID - asuming that we are sending data through ID in params
        const {sectionId}= req.params
        //use find by ID and Delete
        await Section.findByIdAndDelete(sectionId);
        //return response
        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
            UpdateSection,
        });
        
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:"Unable to Delete Section, Please try again ",
            error:error.message,
        });
    }
}