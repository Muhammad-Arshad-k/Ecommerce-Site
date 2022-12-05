var express      = require('express');
const userController = require('../controllers/userController');
const router = express() 

 
router.use(express.json());
router.use(express.urlencoded({extended:true}));

router.get('/',userController.getHome);
router.get('/login',userController.getLogin);
router.post('/login',userController.postLogin)
router.get('/signup',userController.getSignup);
router.post('/signup',userController.postSignup);
router.get('/logout',userController.userLogout)
router.get('/otpPage', userController.getOtpPage);
router.post('/otp', userController.postOtp);
router.get('/shop',userController.getShopPage);
router.get('/productView/:id', userController.getProductViewPage);
router.get('/index',userController.getHome);
router.get('/cart',userController.getCart);
router.get('/about',userController.getAbout);

router.get('/checkout',userController.getCheckout);
router.get('/thankyou',userController.getThankyou);
router.get('/contact',userController.getContact);
router.get('/productView',userController.getShopSingle)



module.exports=router;
  