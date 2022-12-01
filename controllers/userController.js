const express = require('express');
const userSchema = require('../model/userSchema')
const body  = require('body-parser');
const bcrypt = require('bcrypt');
  

async function checkEmail(userEmail){
    const userFound = await userSchema.findOne({email:userEmail})
    if(userFound){
        return true;
    }else{
        return false;
    }
}

module.exports ={

//to render the home page
 getHome : (req,res)=>{
    const user = req.session.user;
    if(user){
        customer = true;
        res.render('user/index',{customer})
    }else{
        customer = false;
        res.render('user/index',{customer})
    }
  
},
 //to render the login page
 getLogin:(req,res)=>{
    res.render('user/login')
},
// to render the signup page
getSignup:(req,res)=>{
    res.render('user/signup');
},

postSignup:async(req,res)=>{
    try{
        if(req.body.email){
            const userExists = await checkEmail(req.body.email)
            if(userExists == true){
                res.redirect('/signup');
            }else{
                const hash = await bcrypt.hash(req.body.password,10)
                const newUser = new userSchema({
                    name:req.body.name,
                    email:req.body.email,
                    phone:req.body.phone,
                    password:hash
                })
                newUser.save().then(()=>{
                    req.session.user = req.body.email
                    res.redirect('/')
                })

            }
        }
    }catch(error){
        console.log(error)
    }
},
postLogin:async(req,res)=>{
    const email    = req.body.email
    const password = req.body.password
    const userData = await userSchema.findOne({email:email})
    try{
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                req.session.user = req.body.email
                res.redirect('/')
            }else{
                res.render('user/login',{invalid:'Invalid Email or Password'})
            }

        }else{
            res.render('user/login',{invalid:'Invalid Email Or Password'})
        }
    }catch(error){
        console.log(error);
    }
},
userLogout:(req,res)=>{
    req.session.destroy()
    res.redirect("/")
},
getCart:(req,res)=>{
    res.render('user/cart')
},
getAbout:(req,res)=>{
    res.render('user/about');
},
getShop:(req,res)=>{
    res.render('user/shop')
},
getCheckout:(req,res)=>{
    res.render('user/checkout');
},
getThankyou: (req,res)=>{
    res.render('user/thankyou');
},
getContact:(req,res)=>{
    res.render('user/contact');
}
}

