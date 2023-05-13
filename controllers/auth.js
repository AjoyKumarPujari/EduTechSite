const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("../models/OTP");

//otp send
exports.sendOTP = async (req,res) => {

    try{
        //fetch email from request body
        const {email} = req.body;

        //check if user already existed
        const checkUserPresent = await User.findOne({email});s
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

//login

//changepassword