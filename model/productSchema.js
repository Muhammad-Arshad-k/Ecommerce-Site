const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({

    name:{
     type:String,
     required:true   
    },
    price:{
        type:Number,
        required:true
    },
    category:{ 
        type:mongoose.SchemaTypes.ObjectId,
        ref:'categories'
    },
    size: [Number],
    description:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    delete:{
        type:Boolean,
        default:false
    }
},
{ timestamps: true }
)


module.exports = mongoose.model('products',productSchema)
   