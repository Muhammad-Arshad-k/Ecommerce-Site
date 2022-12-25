const express = require('express');
const adminRouter = express();
const adminController = require('../controllers/adminController');
const verifylogin     = require('../middlewares/session');
 
adminRouter.get('/',adminController.getAdminLogin)
adminRouter.get('/home',verifylogin.verifyLoginAdmin,adminController.getAdminHome)
adminRouter.get('/dashboard',verifylogin.verifyLoginAdmin,adminController.getDashboard)
adminRouter.post('/login',adminController.postAdminLogin)
adminRouter.get('/adminLogout',adminController.adminLogout)
adminRouter.get('/userDetails',verifylogin.verifyLoginAdmin,adminController.getAllUsers)
adminRouter.get('/blockUser/:id',verifylogin.verifyLoginAdmin,adminController.blockUser)
adminRouter.get('/unblockUser/:id',verifylogin.verifyLoginAdmin,adminController.unblockUser)
adminRouter.get('/addProduct',verifylogin.verifyLoginAdmin,adminController.addProduct)
adminRouter.post('/addSize',verifylogin.verifyLoginAdmin,adminController.addSize);
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
adminRouter.get('/restoreCategory/:id',verifylogin.verifyLoginAdmin,adminController.restoreCategory)
adminRouter.get('/getBanner',verifylogin.verifyLoginAdmin,adminController.getBannerPage)
adminRouter.post('/addBanner',verifylogin.verifyLoginAdmin,adminController.addBanner)
adminRouter.post('/editBanner/:id',verifylogin.verifyLoginAdmin,adminController.editBanner)
adminRouter.get('/deleteBanner/:id',verifylogin.verifyLoginAdmin,adminController.deleteBanner);
adminRouter.get('/restoreBanner/:id',verifylogin.verifyLoginAdmin,adminController.restoreBanner);
adminRouter.get('/coupon',verifylogin.verifyLoginAdmin,adminController.getCouponPage);
adminRouter.post('/addCoupon',verifylogin.verifyLoginAdmin,adminController.addCoupon);
adminRouter.post('/editCoupon/:id',verifylogin.verifyLoginAdmin,adminController.editCoupon);
adminRouter.get('/deleteCoupon/:id',verifylogin.verifyLoginAdmin,adminController.deleteCoupon);
adminRouter.get('/restoreCoupon/:id',verifylogin.verifyLoginAdmin,adminController.restoreCoupon);
adminRouter.get('/removeCoupon/:id',verifylogin.verifyLoginAdmin,adminController.removeCoupon)
adminRouter.get('/order',verifylogin.verifyLoginAdmin,adminController.getOrders)
adminRouter.get('/orderedProduct/:id',verifylogin.verifyLoginAdmin,adminController.getOrderedProduct)
adminRouter.post('/orderStatuschange/:id',adminController.orderStatusChanging)
adminRouter.get('/salesReport',verifylogin.verifyLoginAdmin,adminController.salesReport);
adminRouter.get('/dailyReport',verifylogin.verifyLoginAdmin,adminController.dailyReport);
adminRouter.get('/monthlyReport',verifylogin.verifyLoginAdmin,adminController.monthlyReport)
module.exports= adminRouter;