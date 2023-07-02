 const Profile = require("../models/Profile");
 const user = require("../models/User");
 const { uploadImageToCloudinary } = require("../utils/imageUploader");
 exports.updateProfile = async(req, res)=>{
    try {
        //get data 
        const {dateOfBirth= "", about ="", contactNumber, gender} = req.body;
        //fetch userID
        const id  = req.user.id;
        //validation
        if(!contactNumber || !gender){
            return res.status(400).json({
                success:false,
                message:"All Fields are required",
            });
        }
        //find profile
        const userDetails = await user.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        //update Profile
        profileDetails.dateofBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        //return response
        return res.status(200).json({
            success:true,
            message:"Profile Updated Successfully",
            profileDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"All Fields are required",
            error:error.message,
        });
    }
 }

 //delete profile

 exports.deleteProfile = async (req, res) => {
    try {
        //get ID
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"not a valid user",
            });
        }
        //find by ID and Delete
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //delete user
        await User.findByIdAndDelete({_id:id});
        //TODO: Unrolled user from all rolled user
        //response
        return res.status(200).json({
            success:true,
            message:"Profile Deleted Successfully",
            
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"user Cant be deleted",
            error:error.message,
        });
    }
 }

 exports.getAllUserDetails = async(req, res)=>{
  try {
		const id = req.user.id;
		const userDetails = await user.findById(id)
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
 };


exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await user.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};