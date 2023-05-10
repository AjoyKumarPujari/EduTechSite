const mongoose = require("mongoose");
 
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

module.exports = mongoose.model("OTP",otpSchema);