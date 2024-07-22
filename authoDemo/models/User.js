const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: {type:String,
        unique:true,
required:true},
    password: {type:String,
        required:true,
    minLength:8, }
    ,
    email: {type:String,
        required:true,
        unique:true,
        
    }
    },{timestamps:true})


    module.exports = mongoose.model('User', UserSchema)