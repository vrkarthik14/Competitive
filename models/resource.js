var mongoose = require("mongoose");
var resourceSchema = new mongoose.Schema({
    title:String,
    image:String,
    link:String,
    body:String,
     author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    }
   
});

    var Resource = mongoose.model("Resource", resourceSchema);
    
    module.exports = Resource;