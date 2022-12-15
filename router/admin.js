const express = require('express');
const adminRouter = express();
const adminController = require('../controllers/adminController');
const verifylogin     = require('../middlewares/session');
 
adminRouter.get('/',adminController.getAdminLogin)
adminRouter.get('/home',verifylogin.verifyLoginAdmin,adminController.getAdminHome)
adminRouter.post('/login',adminController.postAdminLogin)
adminRouter.get('/adminLogout',adminController.adminLogout)
adminRouter.get('/userDetails',verifylogin.verifyLoginAdmin,adminController.getAllUsers)
adminRouter.get('/blockUser/:id',verifylogin.verifyLoginAdmin,adminController.blockUser)
adminRouter.get('/unblockUser/:id',verifylogin.verifyLoginAdmin,adminController.unblockUser)
adminRouter.get('/addProduct',verifylogin.verifyLoginAdmin,adminController.addProduct)
adminRouter.post('/postProduct',verifylogin.verifyLoginAdmin,adminController.postProduct)
adminRouter.get('/productDetails',verifylogin.verifyLoginAdmin,adminController.productDetails)
adminRouter.get('/editProduct/:id',verifylogin.verifyLoginAdmin,adminController.editProduct)
adminRouter.post('/postEditproduct/:id',verifylogin.verifyLoginAdmin,adminController.postEditProduct)
adminRouter.get('/deleteproduct/:id',verifylogin.verifyLoginAdmin,adminController.deleteProduct);
adminRouter.get('/restoreProduct/:id',verifylogin.verifyLoginAdmin,adminController.restoreProduct)
adminRouter.get('/category',verifylogin.verifyLoginAdmin,adminController.getCategory)
adminRouter.post('/addCategory',verifylogin.verifyLoginAdmin,adminController.addCategory)
adminRouter.post('/editCategory/:id',verifylogin.verifyLoginAdmin,adminController.editCategory)
adminRouter.get('/deleteCategory/:id',verifylogin.verifyLoginAdmin,adminController.deleteCategory)



module.exports= adminRouter  