const nodemailer  = require('nodemailer');

module.exports={
    mailTransporter:nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:'wonderstories8935@gmail.com',
            pass:'gdwuwyrrdkpyirye'
        }
    }),
}