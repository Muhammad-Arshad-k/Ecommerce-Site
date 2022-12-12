const mongoose = require('mongoose');
const { schema } = require('./userSchema');
const Schema   = mongoose.Schema
const ObjectId = Schema.ObjectId

const orderSchema = new Schema(
    {
        userId:{
           type:ObjectId,
           required:true
        },
        name:{
            type:String,
            requiredd:true
        },
        phoneNumber:{
            type:Number,
            required:true
        },
        orderItem:[
            {
                productId:{
                    type:ObjectId,
                    required:true
                },
                quantity:{
                    type:Number,
                    required:true
                }
            }
        ],
        totalAmount:{
            type:Number,
            required:true
        },
        orderStatus:{
            type:String,
            default:"pending"
        },
        paymentMethod:{
            paymentStatus:{
                type:String,
                default:"not paid"
            }
        },
        orderData:{
            type:String,
        },
        deliveryDate:{
            type:String
        }
    },
    {
        timestamps:true
    }
);

const order= mongoose.model("order",orderSchema)
module.exports = order;