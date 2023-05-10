const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
 
const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        require:true,
    },
    otp:{
        type:String,
        require:true,
    },
    timeStamp:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    },
    
}); 

//function for mail send
async function sendVerificationEmail (email, otp){
    try {
        const mailResponse =  await mailSender(email, "Verification Email ", otp);
        console.log("Email Send Successfully", mailResponse);
    } catch (error) {
        console.log("error occure while sending mail", error);
        throw error;
    }
}
//preemiddleware save attached
otpSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})




module.exports = mongoose.model("OTP",otpSchema);