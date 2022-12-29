const users = require('../model/userSchema')
const bcrypt = require('bcrypt');
const mailer = require("../middlewares/otpValidation");
const products = require('../model/productSchema');
const mongoose = require('mongoose');
const cart = require('../model/cartSchema');
const wishlist = require('../model/wishlistSchema')
const order = require('../model/orderSchema');
const moment = require("moment");
const categories = require('../model/categorySchema');
const coupon = require("../model/couponSchema");
const promise = require('promise'); 
const otp = require('../model/otpSchema');
const banner = require('../model/bannerSchema');
const dotenv      = require("dotenv");
dotenv .config(); 
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

let countInCart;
let countInWishlist;


function checkCoupon(data, id) {
  return new promise((resolve) => {
    if (data.coupon) {
      coupon.find(
        { couponName: data.coupon },
        { users: { $elemMatch: { userId: id } } }
      ).then((exist) => {
        if (exist[0].users.length) {
          resolve(true);
        } else {
          coupon.find({ couponName: data.coupon }).then((discount) => {
            resolve(discount);
          })
        }
      })

    } else {
      resolve(false);
    }
  });
}

module.exports = {

  //to render the home page
  getHome: async (req, res) => {
    try {
      let session = req.session.user;
      let product = await products.find({ delete: false }).populate('category');
      let bannerData = await banner.find().sort({ createdAt: -1 }).limit(1);
      if (session) {
        customer = true;
      } else {
        customer = false;
      }
      res.render('user/index', { customer, product, countInCart, countInWishlist, bannerData });

    } catch {
      console.error()
      res.render('user/error')
    }
  },
  //to render the login page
  getLogin: (req, res) => {
    res.render('user/login')
  },
  // to render the signup page 
  getSignup: (req, res) => {
    res.render('user/signup');
  },

  postSignup: async (req, res) => {
    try {
      const spassword = await bcrypt.hash(req.body.password, 10)
      const name = req.body.name;
      const email = req.body.email;
      const phone = req.body.phone;
      const password = spassword;
      const OTP = `${Math.floor(1000 + Math.random() * 9000)}`
      const botp = await bcrypt.hash(OTP, 10)
      const mailDetails = {
        from: process.env.MAILER_EMAIL,
        to: email,
        subject: 'Otp for Wonder shoes signup',
        html: `<p>Your OTP for registering in wonderShoes  is ${OTP}</p>`

      }
      const userExists = await users.findOne({ email: email });

      if (userExists) {
        res.render('user/signup', { invalid: "User Already Exist" });
      } else {
        const User = {
          name: name,
          email: email,
          phone: phone,
          password: password
        }
        mailer.mailTransporter.sendMail(mailDetails, async function (err) {


          if (err) {
            console.log(err)

          } else {
            const userAlreadyExist = await otp.findOne({ email: email })
            if (userAlreadyExist) {
              otp.deleteOne({ email: email }).then(() => {
                otp.create({
                  email: email,
                  otp: botp
                }).then(() => {
                  res.redirect(`/otpPage?name=${User.name}&email=${User.email}&phone=${User.phone}&password=${User.password}`)

                })
              })
            } else {
              otp.create({
                email: email,
                otp: botp
              }).then(() => {
                res.redirect(`/otpPage?name=${User.name}&email=${User.email}&phone=${User.phone}&password=${User.password}`)
              });
            }
          }
        })
      }
    } catch {
      console.error()
      res.render('user/500');
    }

  }
  ,
  getOtpPage: (req, res) => {
    let userData = req.query
    res.render('user/otp', { userData });
  },
  postOtp: async (req, res) => {
    let userData = req.query
    try {
      const body = req.body;
      const cotp = body.otp;
      const sendOtp = await otp.findOne({ email: body.email })
      const validOtp = await bcrypt.compare(cotp, sendOtp.otp)
      if (validOtp) {
        res.redirect('/login');
        const User = await users.create({
          name: body.name,
          email: body.email,
          phone: body.phone,
          password: body.password
        })
      } else {
        res.render('user/otp', { invalid: 'invalid otp', userData });
      }



    } catch {
      console.error()
      res.render('user/error')
    }

  },
  postLogin: async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const userData = await users.findOne({ email: email })
    try {
      if (userData) {
        if (userData.isBlocked === false) {
          const passwordMatch = await bcrypt.compare(password, userData.password)
          if (passwordMatch) {
            req.session.user = req.body.email
            res.redirect('/')
          } else {
            res.render('user/login', { invalid: 'Invalid username or Password' })
          }
        } else {
          res.render('user/login', { invalid: 'You are blocked' })
        }
      } else {
        res.render('user/login', { invalid: 'Invalid Email Or Password' })
      }
    } catch (error) {
      console.log(error);
    }
  },
  forgotPassword:(req,res)=>{
    res.render('user/forgotPassword');
  },
  postForgotPassword: async (req,res)=>{
      const userEmail= req.body.email; 
      const userData = req.body;
      const isUserExist= await users.findOne({email:userEmail});
      const OTP = `${Math.floor(1000 + Math.random() * 9000)}` 
      const botp = await bcrypt.hash(OTP, 10)
      const mailDetails = {
        from: process.env.MAILER_EMAIL,
        to: userEmail,
        subject: 'Otp for Wonder shoes signup',
        html: `<p>Your OTP for registering in wonderShoes  is ${OTP}</p>`
      }
     if(isUserExist){
      mailer.mailTransporter.sendMail(mailDetails, async function (err) {
      otp.deleteOne({ email: userEmail }).then(() => {
        otp.create({
          email: userEmail,
          otp: botp
        }).then(() => {
          res.render("user/forgotOtp",{userData});    
        })
        })
      }) 
     }else{
      res.render('user/forgotPassword',{error:"please enter a valid Email",userData})
     }
  },
  postForgotOtp:async (req,res)=>{
    let userData = req.query
    try{
      const body = req.body;
      const cotp = body.otp;
      const sendOtp = await otp.findOne({ email: body.email })
      const validOtp = await bcrypt.compare(cotp, sendOtp.otp);    
      if(validOtp){
         res.render('user/changePassword',{userData}); 
      }else{
        res.render("user/forgotOTP",{userData,error:"invalid OTP"})
      }
      }catch(error){
        res.render('user/error');
      }
  },
  postChangePassword:async (req,res)=>{
    try{
      const newPassword= req.body.newPassword;
      const sNewPassword= await bcrypt.hash(newPassword, 10);
      const filter = { email: req.body.email};
      const update = { password: sNewPassword };
       await users.findOneAndUpdate(filter, update, {
        new: true
      }).then(()=>{
        res.redirect('/login');
      })        
    }catch(error){
      console.log(error);
      res.render('user/error');
    }
  },  
  userLogout: (req, res) => {
    req.session.destroy()
    res.redirect("/")
  },
  getShopPage: async (req, res) => {
    let category = await categories.find();
    let product = await products.find({ delete: false }).populate('category');
    let productCount = await products.find({delete:false}).count();
    res.render('user/shop', { product, countInCart, countInWishlist, category,productCount });
  },
  getCategoryWisePage: async (req, res) => {
    const id = req.params.id;
    const category = await categories.find();
    const product = await products.find({ category: id, delete: false }).populate('category');
    const productCount = await products.find({ category: id, delete: false }).populate('category').count();
    res.render('user/shop', { product, countInCart, category, countInWishlist,productCount });
  },
  getProductViewPage: async (req, res) => {
    let id = req.params.id
    let product = await products.findOne({ _id: id }).populate('category');
    let productSize = await products.findOne({_id:id},'size');
    res.render('user/productView', { product: product, countInCart, countInWishlist,productSize });
  },

  addToCart: async (req, res) => {
    const body= req.body;
    const id = req.params.id;
    const objId = mongoose.Types.ObjectId(id);
    const session = req.session.user;
    const size    = body.size;
    let proObj = {
      productId: objId,
      quantity: 1,
      size:size
    };
    const userData = await users.findOne({ email: session });
    const userCart = await cart.findOne({ userId: userData._id });
    if (userCart) {
      let proExist = userCart.product.findIndex(
        (product) => product.productId == id
      );
      if (proExist != -1) {
        await cart.aggregate([
          {
            $unwind: "$product",
          },
        ]); 
        let sameSizeExist= userCart.product[0].size;                      
        if(sameSizeExist==size){ 
          await cart.updateOne(
            { userId: userData._id, "product.productId": objId },
            { $inc: { "product.$.quantity": 1 } }
          );
          res.redirect("/viewcart");
        }else{ 
          const newCart = new cart({
            userId: userData.id,
            product: [
              { 
                productId: objId,
                quantity: 1,
                size: Number(size),
              },
            ],
          });
          newCart.save().then(() => {
    
            res.redirect("/viewcart");
    
    
          });       
        
      } 
      } else {
        cart
          .updateOne({ userId: userData._id }, { $push: { product: proObj } })
          .then(() => {

            res.redirect("/viewcart");

          });
      }
    } else {
      const newCart = new cart({
        userId: userData.id,
        product: [
          {
            productId: objId,
            quantity: 1,
            size: Number(size),
          },
        ],
      });
      newCart.save().then(() => {

        res.redirect("/viewcart");


      });
    }

  },
  viewCart: async (req, res) => {
    const session = req.session.user;
    const userData = await users.findOne({ email: session });
    const productData = await cart
      .aggregate([
        {
          $match: { userId: userData.id },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            productItem: "$product.productId",
            productQuantity: "$product.quantity",
            productSize: '$product.size',
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productItem",
            foreignField: "_id",
            as: "productDetail",
          },
        },
        {
          $project: {
            productItem: 1,
            productQuantity: 1,
            productSize:1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] },
          },
        },
        {
          $addFields: {
            productPrice: {
              $multiply: ["$productQuantity", "$productDetail.price"]
            }
          }
        }
      ])
      .exec();
    const sum = productData.reduce((accumulator, object) => {
      return accumulator + object.productPrice;
    }, 0);
    countInCart = productData.length;
    let id = req.params.id
    let product = await products.findOne({ _id: id })
    res.render("user/cart", { productData, sum, countInCart, product: product, countInWishlist });


  },
  changeQuantity: async (req, res) => {
    const data = req.body;
    const objId = mongoose.Types.ObjectId(data.product);
    cart
      .aggregate([
        {
          $unwind: "$product",
        },
      ])
      .then((data) => {
      });
    cart.updateOne(
      { _id: data.cart, "product.productId": objId },
      { $inc: { "product.$.quantity": data.count } }
    ).then(() => {
      res.json({ status: true });
    })


  },
  removeProduct: async (req, res) => {
    const data = req.body;
    const objId = mongoose.Types.ObjectId(data.product);
    await cart.aggregate([
      {
        $unwind: "$product"
      }
    ]);
    await cart
      .updateOne(
        { _id: data.cart, "product.productId": objId },
        { $pull: { product: { productId: objId } } }
      )
      .then(() => {
        res.json({ status: true });
      });
  },
  totalAmount: async (req, res) => {
    let session = req.session.user;
    const userData = await users.findOne({ email: session });
    const productData = await cart.aggregate([
      {
        $match: { userId: userData.id },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          productItem: "$product.productId",
          productQuantity: "$product.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productItem",
          foreignField: "_id",
          as: "productDetail",
        },
      },
      {
        $project: {
          productItem: 1,
          productQuantity: 1,
          productDetail: { $arrayElemAt: ["$productDetail", 0] },
        },
      },
      {
        $addFields: {
          productPrice: {
            $multiply: ["$productQuantity", "$productDetail.price"],
          },
        },
      },
      {
        $group: {
          _id: userData.id,
          total: {
            $sum: { $multiply: ["$productQuantity", "$productDetail.price"] },
          },
        },
      },
    ]).exec();
    res.json({ status: true, productData });
  },
  addToWishlist: async (req, res) => {

    const id = req.params.id;
    const objId = mongoose.Types.ObjectId(id);
    const session = req.session.user;

    let proObj = {
      productId: objId,
    };
    const userData = await users.findOne({ email: session });
    const userWishlist = await wishlist.findOne({ userId: userData._id });
    if (userWishlist) {

      let proExist = userWishlist.product.findIndex(
        (product) => product.productId == id
      );
      if (proExist != -1) {

        res.redirect('/shop')
      } else {

        wishlist.updateOne(
          { userId: userData._id }, { $push: { product: proObj } }
        ).then(() => {
          res.redirect('/shop')
        });
      }
    } else {
      const newWishlist = new wishlist({
        userId: userData._id,
        product: [
          {
            productId: objId,

          },
        ],
      });
      newWishlist.save().then(() => {
        res.redirect('/shop')
      });
    }

  },
  removeFromWishlist: async (req, res) => {
    const data = req.body;
    const objId = mongoose.Types.ObjectId(data.productId);
    await wishlist.aggregate([
      {
        $unwind: "$product",
      },
    ]);
    await wishlist
      .updateOne(
        { _id: data.wishlistId, "product.productId": objId },
        { $pull: { product: { productId: objId } } }
      )
      .then(() => {
        res.json({ status: true });
      });
  },
  getCheckOutPage: async (req, res) => {
    let session = req.session.user;
    const userData = await users.findOne({ email: session });
    const userId = userData._id.toString()
    const productData = await cart
      .aggregate([
        {
          $match: { userId: userId },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            productItem: "$product.productId",
            productQuantity: "$product.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productItem",
            foreignField: "_id",
            as: "productDetail",
          },
        },
        {
          $project: {
            productItem: 1,
            productQuantity: 1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] },
          },
        },
        {
          $addFields: {
            productPrice: {
              $multiply: ["$productQuantity", "$productDetail.price"]
            }
          }
        }
      ])
      .exec();
    const sum = productData.reduce((accumulator, object) => {
      return accumulator + object.productPrice;
    }, 0);


    res.render("user/checkout", { productData, sum, countInCart, countInWishlist, userData });


  },
  placeOrder: async (req, res) => {

    let invalid;
    let couponDeleted;
    const data = req.body;
    const session = req.session.user;
    const userData = await users.findOne({ email: session })
    const cartData = await cart.findOne({ userId: userData._id });
    const objId = mongoose.Types.ObjectId(userData._id)
    if (data.coupon) {
      invalid = await coupon.findOne({ couponName: data.coupon });
      // console.log(invalid);
      if (invalid?.delete == true) {
        couponDeleted = true
      }
    } else {
      invalid = 0;
    }

    if (invalid == null) {
      res.json({ invalid: true });
    } else if (couponDeleted) {
      res.json({ couponDeleted: true })
    } else {
      const discount = await checkCoupon(data, objId);
      // console.log(discount);
      if (discount == true) {
        res.json({ coupon: true })
      } else {

        if (cartData) {

          const productData = await cart
            .aggregate([
              {
                $match: { userId: userData.id },
              },
              {
                $unwind: "$product",
              },
              {
                $project: {
                  productItem: "$product.productId",
                  productQuantity: "$product.quantity",
                  productSize:"$Product.size"
                },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "productItem",
                  foreignField: "_id",
                  as: "productDetail",
                },
              },
              {
                $project: {
                  productItem: 1,
                  productQuantity: 1,
                  productSize:1,
                  productDetail: { $arrayElemAt: ["$productDetail", 0] },
                },
              },
              {
                $addFields: {
                  productPrice: {
                    $multiply: ["$productQuantity", "$productDetail.price"]
                  }
                }
              }
            ])
            .exec();
          const sum = productData.reduce((accumulator, object) => {
            return accumulator + object.productPrice;
          }, 0);
          if (discount == false) {
            var total = sum; 
          } else {
            var dis = sum * discount[0].discount;
            if (dis > discount[0].maxLimit) {
              total = sum - discount[0].maxLimit;
    
            } else {
              total = sum - dis;
            }
          }
          const orderData = await order.create({
            userId: userData._id,
            name: userData.name,
            phoneNumber: userData.phone,
            address: req.body.address, 
            orderItems: cartData.product,
            totalAmount: total,
            paymentMethod: req.body.paymentMethod,
            // orderStatus: status,
            orderDate: moment().format("MMM Do YY"),
            deliveryDate: moment().add(3, "days").format("MMM Do YY")
          });
         
          const orderId = orderData._id
          
          if (req.body.paymentMethod === "COD")  {
            
          await order.updateOne({_id:orderId},{$set:{orderStatus:'placed'}})       
          await cart.deleteOne({ userId: userData._id });
          res.json({ success: true})
          await coupon.updateOne( {couponName:data.coupon}, {$push:{users: {userId : objId}}})
          } else {
            // const orderId = orderData._id
            const session = await stripe.checkout.sessions.create({ 
              payment_method_types: ["card"], 
              line_items:
                productData.map((ele) => {
                  return { 
                    price_data: { 
                      currency: "inr", 
                      product_data: { 
                        name: ele.productDetail.name, 
                      }, 
                      unit_amount:ele.productDetail.price * 100, 
                    }, 
                    quantity: ele.productQuantity, 
                  }
                }), 
              mode: "payment", 
              success_url: `${process.env.SERVER_URL}/orderSuccess?cartId=${userData._id}&data=${data}&cartData=${cartData}&userData=${userData}`,
              cancel_url: `${process.env.SERVER_URL}/checkout` 
            });  
            console.log(session);
            res.json({ url: session.url})      
          } 

        } else { 
   
          res.redirect("/viewCart");
        }
      }
    }
  },

  orderSuccess: async (req, res) => {
    res.render('user/orderSuccess', { countInCart, countInWishlist })
  },
  orderDetails: async (req, res) => {
    const session = req.session.user;
    const userData = await users.findOne({ email: session });
    const userId   = userData._id
    const objId    = mongoose.Types.ObjectId(userId);
    console.log(objId);
    const productData = await order
    .aggregate([
      {
        $match: { userId: objId }, 
      },
      { 
        $unwind: "$orderItems",
      },  
      { 
        $project: {
          productItem: "$orderItems.productId",
          productQuantity: "$orderItems.quantity",
          productSize:"$orderItems.size",
          address: 1,
          name: 1,
          phonenumber: 1,
          totalAmount:1,
          orderStatus:1,
          paymentMethod:1,
          paymentStatus:1,
          orderDate:1,
          deliveryDate:1,
          createdAt:1,
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "productItem",
          foreignField: "_id",
          as: "productDetail",
        }
      },
      {
        $project: {
          productItem: 1,
          productQuantity: 1,
          name: 1,
          phoneNumber: 1,
          address: 1,
          totalAmount:1,
          orderStatus:1,
          paymentMethod:1,
          paymentStatus:1, 
          orderDate:1,
          deliveryDate:1,
          createdAt:1,
          productDetail: { $arrayElemAt: ["$productDetail", 0] },
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetail.category',
          foreignField: "_id",
          as: "category_name"
        }
      },
      {
        $unwind: "$category_name"
      } 
  
    ]).sort({ createdAt: -1 }); 
    const orderDetails = await order.find({ userId: userData._id }).sort({ createdAt: -1 });
    console.log(productData.length)
    res.render('user/orderDetails', { productData,orderDetails, countInCart, countInWishlist });
  },
  orderedProduct: async (req, res) => {
    const id = req.params.id;
    const session = req.session.user; 
    const userData = await users.findOne({ email: session });
    const orderDetails = await order.find({ userId: userData._id }).sort({ createdAt: -1 })
    const objId = mongoose.Types.ObjectId(id);
    const productData = await order
      .aggregate([
        {
          $match: { _id: objId },
        },
        {
          $unwind: "$orderItems",
        },
        {
          $project: {
            productItem: "$orderItems.productId",
            productQuantity: "$orderItems.quantity",
            productSize:"$orderItems.size",
            address: 1,
            name: 1,
            phonenumber: 1
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "productItem",
            foreignField: "_id",
            as: "productDetail",
          }
        },
        {
          $project: {
            productItem: 1,
            productQuantity: 1,
            name: 1,
            phoneNumber: 1,
            address: 1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] },
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'productDetail.category',
            foreignField: "_id",
            as: "category_name"
          }
        },
        {
          $unwind: "$category_name"
        } 

      ]);
   
    // console.log(orderDetails);
    
    res.render('user/orderedProduct', { productData, orderDetails, countInCart, countInWishlist });
  },
  cancelOrder: async (req, res) => {
    const data = req.params.id;
    await order.updateOne({ _id: data }, { $set: { orderStatus: "cancelled" } })
    res.redirect("/orderDetails");

  },
  viewWishlist: async (req, res) => {

    const session = req.session.user;
    const userData = await users.findOne({ email: session })
    const userId = mongoose.Types.ObjectId(userData._id);;
    const wishlistData = await wishlist
      .aggregate([
        {
          $match: { userId: userId }
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            productItem: "$product.productId",

          }
        },
        {
          $lookup: {
            from: "products",
            localField: "productItem",
            foreignField: "_id",
            as: "productDetail",
          }
        },
        {
          $project: {
            productItem: 1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] }
          }
        }

      ])
    countInWishlist = wishlistData.length
    res.render('user/wishlist', { wishlistData, countInWishlist, countInCart })

  },
  viewProfile: async (req, res) => {
    const session = req.session.user;
    let userData = await users.findOne({ email: session })
    res.render('user/profile', { userData, countInCart, countInWishlist })
  },
  editProfile: async (req, res) => {
    const session = req.session.user;
    let userData = await users.findOne({ email: session })
    res.render('user/editProfile', { userData, countInCart, countInWishlist })
  },
  postEditProfile: async (req, res) => {
    const session = req.session.user;
    await users.updateOne(
      { email: session },
      {
        $set: {

          name: req.body.name,
          phonenumber: req.body.phone,
          addressDetails: [
            {
              housename: req.body.housename,
              area: req.body.area,
              landmark: req.body.landmark,
              district: req.body.district,
              state: req.body.state,
              postoffice: req.body.postoffice,
              pin: req.body.pin
            }
          ]

        }
      }
    );

    res.redirect('/viewProfile')
  },
  addNewAddress: async (req, res) => {
    const session = req.session.user
    const addObj = {
      housename: req.body.housename,
      area: req.body.area,
      landmark: req.body.landmark,
      district: req.body.district,
      state: req.body.state,
      postoffice: req.body.postoffice,
      pin: req.body.pin
    }
    await users.updateOne({ email: session }, { $push: { addressDetails: addObj } })
    res.redirect('/checkout')
  },
  getAbout: (req, res) => {
    res.render('user/about', { countInWishlist, countInCart });
  },
  getContact: (req, res) => {
    res.render('user/contact', { countInWishlist, countInCart });
  }
}




