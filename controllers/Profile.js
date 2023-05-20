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
        //fetch ID
        const id = req.user.id;
        //get user detail
        const userDetails = await User.findById(id).populate("additionalDetails").exact();
        //return response
        return res.status(200).json({
            success:true,
            message:"user data fetched",
        });
        
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"user data can't be  fetched",
            error:error.message,
        });
    }
 }