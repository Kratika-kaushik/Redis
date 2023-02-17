const mongoose=require('mongoose')

const StudentSchema=new mongoose.Schema({

   
        first_name : String,
        last_name : String,
        classs : String,
        age : Number
     },{timestamps: true}
     
)
var Student = mongoose.model('Student', StudentSchema);
module.exports=Student