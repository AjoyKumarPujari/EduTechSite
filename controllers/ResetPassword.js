const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
//resetpasswordToken
exports.resetPasswordToken = async (req, res) => {
    try {
            //get email from req body
    const email = req.body.email;
    //check user for this email, validation email
    const user = await User.findOne({email: email});
    if(!user){
        return res.status(400).json({
            success:false,
            message:"Your Email is not registered with Us",
        });
    }
    //generate token
    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
        {email:email},
        {
            token:token,
            resetPasswordExpires: Date.now() + 5*60*1000,
        },
        {new:true}//updated document returns
    );
    //create URL
    const url = `http://localhost:3000/update-password/${token}`
    //Send mail containing URL
    await mailSender(
        email, 
        "Password Reset Link", 
        `Password Reset Link: ${url}`
        );
    
    //return response 
    return res.json({
        success:true,
        message:"Email sent successfully , Please check email and change the password"
    })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message: "Something Went Wrong while Sending reset password "
        })
    }
}

//restPassword
exports.resetPassword =async(req, res) => {
try {
        //data fetch
        const {password, confirmPassword, token} = req.body;

        //validation
        if(password != confirmPassword){
            return res.json({
                success:false,
                message:'Password not Matching',
            });
        }
        //get userdetails from db by using token
        const userDetails = await User.findOne({token:token});
        //if no entry-- invalid token
        if( !userDetails){
            return res.json({
                success:false,
                message:'Token Invalid'
            });
        }
         //or expire time of tokrn -- invalid token
        if(userDetails.resetPasswordExpires > Date.now()){
            return res.json({
                success:false,
                message:'Token Expires Please regenerate your token '
            });
        }
        
        //hash pwd2
        const hashedPassword = await bcrypt.hash(password, 10);
        //update the password in db
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );
        //return response
        return res.status(200).json({
            success:true,
            message: "Password reset successfull "
        });
    }
 catch (error) {
    return res.status(200).json({
        success:false,
        message: "something went wrong!! plese Reset Password Again "
    });
}

}

//