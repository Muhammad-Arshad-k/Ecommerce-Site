const express = require('express');
const userSchema = require('../model/userSchema')
const bcrypt = require('bcrypt');
const mailer = require("../middlewares/otpValidation");

async function checkEmail(userEmail){
    const userFound = await userSchema.findOne({ email: userEmail })
    if(userFound){
        return true
    }else{
        return false
    }
}


let name;
let email;
let phone;
let password;

module.exports = {

    //to render the home page
    getHome: (req, res) => {
        const user = req.session.user;
        if (user) {
            customer = true;
            res.render('user/index', { customer })
        } else {
            customer = false;
            res.render('user/index', { customer })
        }

    },
    //to render the login page
    getLogin: (req, res) => {
        res.render('user/login')
    },
    // to render the signup page
    getSignup: (req, res) => {
        res.render('user/signup');
    },

    postSignup: async (req, res) => {

        const spassword = await bcrypt.hash(req.body.password, 10)
        console.log(spassword)
            name = req.body.name,
            email = req.body.email,
            phone = req.body.phone,
            password = spassword

        const mailDetails = {
            from: 'wonderstories8935@gmail.com',
            to: email,
            subject: 'Otp for Wonder shoes signup',
            html: `<p>Your OTP for registering in wonderShoes  is ${mailer.OTP}</p>`
           
        }
        
        const userExists = await checkEmail(req.body.email);
        console.log(userExists)
        if (userExists) {
            res.render('user/signup', { invalid: "User Already Exist" });
        } else {
            mailer.mailTransporter.sendMail(mailDetails, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("otp generated");
                    res.redirect('/otpPage');
                } 


            })
        }

    }

    ,
    getOtpPage:(req,res)=>{
     res.render('user/otp')
    },
    postOtp:async(req,res)=>{
        let otp = req.body.otp;

        if(mailer.OTP===otp){
          try{
            const user = await userSchema.create({
                name:name,
                email:email,
                phone:phone,
                password:password
            })
            
          }catch(error){
            console.log(error)
          }
          res.redirect('/login')
        }else{
            res.render('user/otp',{invalid:"invalid OTP"})
        }
    },
    postLogin: async (req, res) => {
        const email = req.body.email
        const password = req.body.password
        const userData = await userSchema.findOne({ email: email })
        try {
            if (userData) {
                if (userData.isBlocked === false) {
                    const passwordMatch = await bcrypt.compare(password, userData.password)
                    if (passwordMatch) {
                        req.session.user = req.body.email
                        res.redirect('/')
                    } else {
                        res.render('user/login', { invalid: 'Invalid Email or Password' })
                    }
                } else {
                    res.render('user/login', { invalid: 'user blocked' })
                }
            } else {
                res.render('user/login', { invalid: 'Invalid Email Or Password' })
            }
        } catch (error) {
            console.log(error);
        }
    },
    userLogout: (req, res) => {
        req.session.destroy()
        res.redirect("/")
    },
    getCart: (req, res) => {
        res.render('user/cart')
    },
    getAbout: (req, res) => {
        res.render('user/about');
    },
    getShop: (req, res) => {
        res.render('user/shop')
    },
    getCheckout: (req, res) => {
        res.render('user/checkout');
    },
    getThankyou: (req, res) => {
        res.render('user/thankyou');
    },
    getContact: (req, res) => {
        res.render('user/contact');
    },
    getShopSingle: (req,res)=>{
        res.render('user/productView');
    }
}

