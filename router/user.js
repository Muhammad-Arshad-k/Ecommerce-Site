var express      = require('express');
const userController = require('../controllers/userController');
const router = express() 
const verifyLogin= require("../middlewares/session");

 
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
router.get('/category/:id',userController.getCategoryWisePage);     
router.get('/productView/:id', userController.getProductViewPage);
router.post('/removeProduct', userController. removeProduct);
router.post('/changeQuantity',userController.changeQuantity);
router.get('/about',userController.getAbout);
router.get('/viewProfile',verifyLogin.verifyLoginUser,userController.viewProfile);
router.get('/editProfile',userController.editProfile);
router.post('/postEditProfile',userController.postEditProfile) 
router.get('/contact',userController.getContact);
router.post('/cart/:id',verifyLogin.verifyLoginUser,userController.addToCart);
router.get('/viewcart',verifyLogin.verifyLoginUser,userController.viewCart); 
router.post('/addNewAddress', userController.addNewAddress); 
router.post("/placeOrder", verifyLogin.verifyLoginUser, userController.placeOrder);
router.get('/orderDetails', verifyLogin.verifyLoginUser,userController.orderDetails);
router.get('/viewWishlist',verifyLogin.verifyLoginUser,userController.viewWishlist);
router.get('/wishList/:id',verifyLogin.verifyLoginUser,userController.addToWishlist);
router.post('/removeFromWishlist', verifyLogin.verifyLoginUser,userController.removeFromWishlist);
router.get('/checkout',userController.getCheckOutPage);
router.get('/orderSuccess',userController.orderSuccess)
router.get('/orderedProduct/:id',verifyLogin.verifyLoginUser,userController.orderedProduct);
router.get('/cancelOrder/:id',verifyLogin.verifyLoginUser,userController.cancelOrder);
module.exports=router;    
      