var express      = require('express');
const userController = require('../controllers/userController');
const router = express()

 
router.use(express.json());
router.use(express.urlencoded({extended:true}));

router.get('/',userController.getHome);

router.get('/login',userController.getLogin);
router.post('/login',userController.postLogin)

router.get('/signup',userController.getSignup);
router.post('/signup',userController.postSignup)



router.get('/index',userController.getHome);
router.get('/cart',userController.getCart);
router.get('/about',userController.getAbout);
router.get('/shop',userController.getShop);
router.get('/checkout',userController.getCheckout);
router.get('/thankyou',userController.getThankyou);
router.get('/contact',userController.getContact);

router.get('/logout',userController.userLogout)

module.exports=router;
  