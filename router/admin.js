const express = require('express');
const adminRouter = express();
const adminController = require('../controllers/adminController')

adminRouter.get('/',adminController.getAdminLogin)
adminRouter.get('/home',adminController.getAdminHome)
adminRouter.post('/login',adminController.postAdminLogin)
adminRouter.get('/logout',adminController.adminLogout)
adminRouter.get('/userDetails',adminController.getAllUsers)

module.exports= adminRouter