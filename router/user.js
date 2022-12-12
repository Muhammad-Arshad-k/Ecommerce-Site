var express      = require('express');
const userController = require('../controllers/userController');
const router = express() 
const verifyLogin= require("../middlewares/session")
 
router.use(express.json());
router.use(express.urlencoded({extended:true}));

router.get('/',userController.getHome);
router.get('/index',userController.getHome);
router.get('/login',userController.getLogin);
router.post('/login',userController.postLogin)
router.get('/signup',userController.getSignup);
router.post('/signup',userController.postSignup);
router.get('/logout',userController.userLogout)
router.get('/otpPage', userController.getOtpPage);
router.post('/otp', userController.postOtp);
router.get('/shop',userController.getShopPage);
router.get('/productView/:id', userController.getProductViewPage);
router.post('/removeProduct', userController. removeProduct);
router.post('/changeQuantity',userController.changeQuantity);
router.get('/about',userController.getAbout);
router.get('/viewProfile',verifyLogin.verifyLoginUser,userController.viewProfile);
router.get('/editProfile',userController.editProfile);
router.post('/postEditProfile',userController.postEditProfile)
router.get('/checkout',userController.getCheckOutPage);
router.get('/thankyou',userController.getThankyou);
router.get('/contact',userController.getContact);
router.get('/productView',userController.getShopSingle);
router.get('/cart/:id',userController.addToCart);
router.get('/getCart',userController.getCart)
router.get('/viewCart',verifyLogin.verifyLoginUser,userController.viewCart); 
router.post('/addNewAddress', userController.addNewAddress); 
router.post("/placeOrder", verifyLogin.verifyLoginUser, userController.placeOrder);
router.get('/orderSuccess', verifyLogin.verifyLoginUser,userController.orderSuccess);
router.get('/orderDetails',userController.orderDetails);
router.get('/viewWishlist',verifyLogin.verifyLoginUser,userController.viewWishlist)
router.get('/wishList/:id',verifyLogin.verifyLoginUser,userController.addToWishlist)
router.get('/orderedProduct/:id',verifyLogin.verifyLoginUser,userController.orderedProduct);
router.post('/cancelOrder/:id',verifyLogin.verifyLoginUser,userController.cancelOrder);
module.exports=router;
  