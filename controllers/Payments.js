const {instance} = require("../config/razorpay.js");
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
//authorization payment
//varifysignature

exports.verifySignature = async( req, res)=> {
//need to matching server ke andar wala secreate key and razorpay given wala secrate key
const webhookSecret = "12345678"; 

const signature = req.headers["x-razorpay-signature"];//key from razor pay  

const shasum = crypto.createHmac("sha256", webhookSecret);//hashing function object create 
//algo and secreat key

//convert to string
shasum.update(JSON.stringify(req.body));
const digest = shasum.digest("hex");


//validation done and payment successfull
if(signature === digest)
{
    console.log("payment is authorized");
    //enrolled the user in the course

    const {courseId, userId } = req.body.payload.payment.entity.notes;
    try {
        //full fill the action
        //find the course and enroll this student
        const enrolledCourse = await Course.findOneAndUpdate(
                                            {_id:courseId},
                                            {$push:{studentsEnrolled:userId}},
                                            {new:true},
        );
        if(!enrolledCourse){
            return res.status(500).json({
                success:false,
                message:"Course not Found"
            });
        }
        console.log(enrolledCourse);

        //find the student and add the course to their list of enrolled course me
        const enrolledStudent = await User.findByIdAndUpdate(
                                        {_id:userId},
                                        {$push:{courses:courseId}},
                                        {new:true},
        );
        console.log(enrolledStudent); 

        //mail send kardo confirmation wala
        const emailResponse = await mailSender(
                                enrolledStudent.email,
                                "Congratulation !!",
                                " You enrolled the course",

        );
        console.log(emailResponse);
        return res.status(200).json({
            success:true,
            message:"Signature Varified and Course Added",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
            
        });
    }
     
}
else{
    return res.status(400).json({
        success:false,
        message:"Invalid request",
    })
}



};