const Subsection =require("../models/Subsection");
const Section = require("../models/Section"); 
const {uploadImageToCloudinary} = require("../utils/imageUploader"); 
//create subsection logic 
exports.createSubsection = async (req, res) => {
    try {
        // fetch data from request body
        const {sectionId, title, timeDuration, description} = req.body;
        //extract file/vdo
        const video = req.files.VideoFile;
        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            if(!sectionName|| ! sectionId){
                return res.status(400).json({
                    success:false,
                    message:"All Fields are required",
                });
            }
        }
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        
        //create SUBSECTION
        const SubsectionDetails = await Subsection.create({
            title:title,
            timeDuration:timeDuration,
            description: description,
            videoUrl:uploadDetails.secure_url,
        }) 
        //update subsection with this sub section object ID 
        const updateSection = await Section.findByIdAndUpdate({_id:sectionId},
                                            {$push:{
                                                Subsection: SubsectionDetails._id
                                            }},{new:true});
        //HW: log updated section here, after adding populate query
        //return Response
        return res.status(200).json({
            success:true,
            message:"Sub Section Created Successfully",
            updateSection,
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"All Fields are required",
            error:error.message,
        });
    }
};
//hw: update Subsection