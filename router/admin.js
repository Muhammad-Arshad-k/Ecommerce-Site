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
adminRouter.get('/addProduct',adminController.addProduct)
adminRouter.post('/postProduct',adminController.postProduct)
adminRouter.get('/productDetails',adminController.productDetails)
adminRouter.get('/editProduct/:id',adminController.editProduct)
adminRouter.post('/postEditproduct/:id',adminController.postEditProduct)
adminRouter.get('/deleteproduct/:id',adminController.deleteProduct)
adminRouter.get('/category',adminController.getCategory)
adminRouter.post('/addCategory',adminController.addCategory)
adminRouter.post('/editCategory/:id',adminController.editCategory)
adminRouter.get('/deleteCategory/:id',adminController.deleteCategory)



module.exports= adminRouter 