const Tag = require("../models/Tags");

//create tag handler function

exports.createTag = async(req, res) => {
    try {
        //fetch/get data from req body
        const {name, description } = req.body;
        //validation
        if(!name || !description){
            return res.status(500).json({
                success:false,
                message:"All Fields are required",
            });
        }
        //create entry in DB
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"Tag created Successfully",
        }); 
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });  
    }
}