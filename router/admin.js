const express = require('express');
const adminRouter = express();
const adminController = require('../controllers/adminController')

adminRouter.get('/',adminController.getAdminLogin)
adminRouter.get('/home',adminController.getAdminHome)
adminRouter.post('/login',adminController.postAdminLogin)
adminRouter.get('/logout',adminController.adminLogout)
adminRouter.get('/userDetails',adminController.getAllUsers)
adminRouter.get('/blockUser/:id',adminController.blockUser)
adminRouter.get('/unblockUser/:id',adminController.unblockUser)
module.exports= adminRouter