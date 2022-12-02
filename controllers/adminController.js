const express = require('express');
const body    = require('body-parser');

require('dotenv').config()
const user = require('../model/userSchema');
const aEmail  = process.env.ADMIN_EMAIL
const aPassword = process.env.ADMIN_PASSWORD

module.exports={
    getAdminLogin:(req,res)=>{
        const admin=req.session.admin
        if(admin){
            res.render('admin/home')
        }else{
            res.render('admin/login')
        }
    },
    getAdminHome:(req,res)=>{
    const admin= req.session.admin
    if(admin){
        res.render('admin/home');
    }else{
        res.render('admin/login');
     }
    },
    postAdminLogin:(req,res)=>{
        if(req.body.email === aEmail && req.body.password=== aPassword){
            req.session.admin = aEmail
            res.redirect('/admin/home')
        }else{
            res.render('admin/login',{invalid:"invalid username or password"});
        }
      },
      adminLogout:(req,res)=>{
        req.session.destroy()
        res.redirect('/admin')
      },
      getAllUsers:async(req,res)=>{
        const admin = req.session.admin

            if(admin){
                const users  = await user.find()
                res.render('admin/userDetails',{users})
            }else{
                res.redirect('/admin');
            }
        },
        blockUser :async (req,res)=>{
            const id = req.params.id;
            await user.updateOne({_id:id},{$set:{isBlocked:true}}).then(()=>{
                res.redirect("/admin/userDetails")
            })
        },
        unblockUser:async (req,res)=>{
            const id = req.params.id;
            await user.updateOne({_id:id},{$set:{isBlocked:false}}).then(()=>{
                res.redirect('/admin/userDetails');
            })
        }
}
