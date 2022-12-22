const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const otpSchema = new Schema({
    otp:{
        type:String,
        required:true
    },
    email:{
        type:String
    }
}); 

const otp = mongoose.model('otp',otpSchema)
module.exports = otp;
 