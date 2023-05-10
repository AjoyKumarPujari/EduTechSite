const mongoose = require("mongoose");
 
const sectionSchema = new mongoose.Schema({
    sectionName:{
        type:String,
    },
    subSection:[
        { 
            type:mongoose.Schema.Types.ObjectId,
            ref:"Subsection",
            require:true,
        }
    ],
     
    
   
}); 

module.exports = mongoose.model("Section",sectionSchema);