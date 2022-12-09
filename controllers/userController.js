const users = require('../model/userSchema')
const bcrypt = require('bcrypt');
const mailer = require("../middlewares/otpValidation");
const products = require('../model/productSchema');
const mongoose = require('mongoose');
const cart = require('../model/cartSchema');




let name;
let email;
let phone;
let password;
let countInCart;

module.exports = {

  //to render the home page
  getHome: async (req, res) => {
    const session = req.session.user;
    let product = await products.find({ delete: false }).populate('category')
    if (session) {
      customer = true;
    } else {
      customer = false;
    }
    res.render('user/index', { customer, product, countInCart })
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

    const spassword = await bcrypt.hash(req.body.password, 10)

    name = req.body.name,
      email = req.body.email,
      phone = req.body.phone,
      password = spassword

    const mailDetails = {
      from: 'wonderstories8935@gmail.com',
      to: email,
      subject: 'Otp for Wonder shoes signup',
      html: `<p>Your OTP for registering in wonderShoes  is ${mailer.OTP}</p>`

    }

    const userExists = await users.findOne({ email: email });
    if (userExists) {
      res.render('user/signup', { invalid: "User Already Exist" });
    } else {
      mailer.mailTransporter.sendMail(mailDetails, function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log("otp generated");
          res.redirect('/otpPage');
        }


      })
    }

  }

  ,
  getOtpPage: (req, res) => {
    res.render('user/otp')
  },
  postOtp: async (req, res) => {
    const otp = req.body.otp;

    if (mailer.OTP === otp) {
      try {
        const user = await users.create({
          name: name,
          email: email,
          phone: phone,
          password: password
        })

      } catch (error) {
        console.log(error)
      }
      res.redirect('/login')
    } else {
      res.render('user/otp', { invalid: "invalid OTP" })
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
            res.render('user/login', { invalid: 'Invalid Email or Password' })
          }
        } else {
          res.render('user/login', { invalid: 'user blocked' })
        }
      } else {
        res.render('user/login', { invalid: 'Invalid Email Or Password' })
      }
    } catch (error) {
      console.log(error);
    }
  },
  userLogout: (req, res) => {
    req.session.destroy()
    res.redirect("/")
  }, 
  getShopPage: async (req, res) => {
    let product = await products.find({ delete: false })
    res.render('user/shop', { product, countInCart })
  },
  getProductViewPage: async (req, res) => {
    let id = req.params.id
    let product = await products.findOne({ _id: id })
    res.render('user/productView', { product: product, countInCart });
  },
  addToCart: async (req, res) => {
    const id = req.params.id;
    const objId = mongoose.Types.ObjectId(id);
    const session = req.session.user;
    let proObj = {
      productId: objId,
      quantity: 1,
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
        await cart.updateOne(
          { userId: userData._id, "product.productId": objId },
          { $inc: { "product.$.quantity": 1 } }
        );
        res.redirect("/viewcart");
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
    countInCart = productData.length;
    let id = req.params.id
    let product = await products.findOne({ _id: id })
    res.render("user/cart", { productData, sum, countInCart,product:product });


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
        console.log(data);
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
    ])
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
  viewProfile:async (req,res)=>{
   const session = req.session.user;
   let userData = await users.findOne({email:session})
   res.render('user/profile',{userData,countInCart})
  },
  editProfile:async(req,res)=>{
    const session = req.session.user;
   let userData = await users.findOne({email:session})
    res.render('user/editProfile',{userData,countInCart})
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
  getCheckOutPage: async (req, res) => {
    let session = req.session.user;
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


    res.render("user/checkout", { productData, sum, countInCart, userData });


  },
 
  getAbout: (req, res) => {
    res.render('user/about');
  },
  
  getThankyou: (req, res) => {
    res.render('user/thankyou');
  },
  getContact: (req, res) => {
    res.render('user/contact');
  },
  getShopSingle: (req, res) => {
    res.render('user/productView');
  }
}

