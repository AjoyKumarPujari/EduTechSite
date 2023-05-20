 const Profile = require("../models/Profile");
const profile = require("../models/Profile");
 const user = require("../models/User");

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