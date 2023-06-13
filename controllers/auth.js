const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config;
//otp send
exports.sendOTP = async (req,res) => {

    try{
        //fetch email from request body
        const {email} = req.body;

        //check if user already existed
        const checkUserPresent = await User.findOne({email});
        //if user already existed , then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }
        //generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP GENERATE", otp);
        //check unique otp or not
        let result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator(6, {
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }
        //make otp object 
        const otpPayload = (email. otp );
        //Create an otp in DB
        const otpBody = await OTP.create(otpPayLoad) ;

        //return response successfully
        res.status(200).json({
            success:true,
            message:"OTP SENT SUCCESSFULLy",
            otp,
        })

    }
    catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            })
    }
    

    
};

//signup

exports.signUp = async (req,res) => {
    try{
         //data fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
    
        //validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType ||!contactNumber || !otp)
        {
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
        }
        //2 password match karloo(password and confirm password)
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'Password and Confirm Password value doesnot Matched, Please Try again',
            });
        }
    
        ///checkuser already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:"User is Already Ready Registered",
            });
        }
    
        ///find most recent OTP stored for the user
        const recentOTP = await OTP.find({email}).sort({createdAt:-1}).limit(1);  //recent entry otp data fatch
        console.log(recentOTP);
    
        //validate OTP
        if(recentOTP.length == 0){
            return res.status(400).json({
                success:false,
                message:"OTP Not Valid",
            });
        }else if (otp !== recentOTP){
            //Invalid OTP 
            return res.status(400).json({
                success:false,
                message:"OTP Not Match , pls try again",
            });
        }
    
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        //entry create in DB 
        //since profile is linked to User so it is needed to create first after the able to create User
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
    
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`,
        })
        //return response 
        return res.status(200).json({
            success:true,
            message: "User is regeistered Successfully",
            user,
        })
    }
   catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"User cannot be Regostered, please try again",
    })
   }
};

//login

exports.login = async(req, res) =>{
     try {
        //get data from req body
        const {email, password} = req.body;

        //validation of data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again",
            })
        }
        //check user if registered or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered , Please sign up once",
            })
        }
        //generate JWT token , after password match
        if(await bcrypt.compare(password, user.password)){
            const payload ={
                email: user.email,
                id: user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;

            //create cookie and send response
            const options ={
                expires: new Date(Date.now() + 3*34*60*60*100),//3days
                httpOnly: true,
            }  
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in Successfully',
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is Incorrect",
            })
        }
        
        
     } catch (error) {
        console.log(error);
        return res.status(500).json({
        success:false,
        message:"Login Failer, Please try Again ",
    })
     }
};

//changepassword
exports.changePassword = async (req, res)=>{
    try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
}