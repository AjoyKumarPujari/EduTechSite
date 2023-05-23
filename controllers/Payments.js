const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const courseEnrollmentEmail = require("../mail/templates/courseEnrollmentEmail");
const { validatePaymentVerification } = require("razorpay/dist/utils/razorpay-utils");


//capture the razor pay and initiate the razor pay  order
exports.capturePayment=async(req, res) => {
    //get course ID and USER ID
    const {course_id} = req.body; //request body
    const userId = req.User.id; //request user id

    //valide courseId 
    if(!course_id){
        return res.status(404).json({
            success:false,
            message:"Please provide course ID ", 
        });
    }
    //valid coursedetail
    let course;
    try{
        course = await Course.findById(course_id);//db call
        if(!course){
            return res.json({
                success:false,
                message:"Could not find the course ",
            });
        }
        //user already pay for the same order or not
        const uid = new mongoose.Type.ObjectId(userId);//user id convert to object id
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:"Student is Already enrolled ",
            });
        }

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error,
            
        });
    }
    
    //order created
    //syntex from razor pay documentation
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount:amount * 100, //always
        currency, //currency
        receipt: Math.random(Date.now()).toString(), //receipt no random
        notes:{
            courseId:course_id,
            userId,
        }
    };

    try {
        // initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        //return response
        return res.status(200).json({
            success:true,
            message:error,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId: paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
            
        });

    } catch (error) {
        console.log(error);
        res.json({
            success:false,
            message:"Could not initiate order",
            
        });
    }
    
};