const jwt = require("jsonwebtoken");
require("dotenv");
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
try {
    //extract token
    const token = req.cookies.token 
                || req.body.token 
                || req.header("Authorization").replace("Bearer", "");
    //if token missing
    if(!token) {
        return res.status(401).json({
            success:false,
            message:"Token is Missing",
        });
    }

    //verify token
    try {
        const decode =  jwt.verify(token, process.env.JWT_SECRET);
        console.log(decode);
        req.user = decode;
    } catch (error) {
        // verification ISSUE
        return res.status(401).json({
            success:false,
            message:"Token is Invalid",
        });
    }
    next();
    
} catch (error) {
    return res.status(401).json({
        success:false,
        message:"Something went Wrong while validating the token",
    });
}
}

//isStudent
exports.isStudent

//isinstructor

//isAdmin

