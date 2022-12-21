const user = require('../model/userSchema');
const products = require('../model/productSchema');
const categories = require('../model/categorySchema');
const order = require('../model/orderSchema');
const mongoose = require("mongoose");
const coupon   = require('../model/couponSchema');
const banner   = require('../model/bannerSchema');
const moment = require("moment");
moment().format();


module.exports = {
    getAdminLogin:async (req, res) => {
        const admin = req.session.admin
        if (admin) {
            const orderData = await order.find({orderStatus:{$ne:"cancelled"}});
            const totalRevenue = orderData.reduce((accumulator,object)=>{
                return accumulator+object.totalAmount;
            },0);
            const todayOrder = await order.find({
                orderDate:moment().format("MMM Do YY"),
            });
            const todayRevenue = todayOrder.reduce((accumulator,object)=>{
                return accumulator +object.totalAmount;
            },0);
            const start = moment().startOf("month");
            const end   = moment().endOf("month");
            const oneMonthOrder = await order.find({orderStatus:{$ne:"cancelled"},createdAt:{$gte:start,$lte:end},})
            const monthlyRevenue = oneMonthOrder.reduce((accumulator,object)=>{
                return accumulator+object.totalAmount
            },0);
            const allOrders = orderData.length;
            const pending   = await order.find({orderStatus:"pending"}).count();
            const shipped = await order.find({orderStatus:"shipped"}).count();
            const delivered = await order.find({orderStatus:"delivered"}).count();
            const cancelled = await order.find({orderStatus:"cancelled"}).count();
            const cod    = await order.find({paymentStatus:"COD"}).count();
            const online    = await order.find({paymentStatus:"online"}).count();
            const activeUsers = await user.find({isBlocked:false}).count();
            const product     = await  products.find({delete:false}).count();
            const allOrderDetails= await order.find({paymentStatus:"paid"},{paymentStatus:"delivered"});
            res.render('admin/home',{todayRevenue,totalRevenue,allOrders,pending,shipped,delivered,cancelled,cod,online,monthlyRevenue,activeUsers,product})
        } else {
            res.render('admin/login')
        }
    },
    getDashboard:async (req,res)=>{
        const orderData = await order.find({orderStatus:{$ne:"cancelled"}});
        const totalRevenue = orderData.reduce((accumulator,object)=>{
            return accumulator+object.totalAmount;
        },0);
        const todayOrder = await order.find({
            orderDate:moment().format("MMM Do YY"),
        });
        const todayRevenue = todayOrder.reduce((accumulator,object)=>{
            return accumulator +object.totalAmount;
        },0);
        const start = moment().startOf("month");
        const end   = moment().endOf("month");
        const oneMonthOrder = await order.find({orderStatus:{$ne:"cancelled"},createdAt:{$gte:start,$lte:end},})
        const monthlyRevenue = oneMonthOrder.reduce((accumulator,object)=>{
            return accumulator+object.totalAmount
        },0);
        const allOrders = orderData.length;
        const pending   = await order.find({orderStatus:"pending"}).count();
        const shipped = await order.find({orderStatus:"shipped"}).count();
        const delivered = await order.find({orderStatus:"delivered"}).count();
        const cancelled = await order.find({orderStatus:"cancelled"}).count();
        const cod    = await order.find({paymentStatus:"COD"}).count();
        const online    = await order.find({paymentStatus:"online"}).count();
        const activeUsers = await user.find({isBlocked:false}).count();
        const product     = await  products.find({delete:false}).count();
       
        res.render('admin/dashboard',{cod,online,pending,shipped,delivered,cancelled,totalRevenue,allOrders,activeUsers,product ,monthlyRevenue,todayRevenue });
    },
    getAdminHome: (req, res) => {
        const admin = req.session.admin
        if (admin) {
            res.render('admin/home');
        } else {
            res.render('admin/login');
        }
    },
    postAdminLogin: (req, res) => {
        if (req.body.email === aEmail && req.body.password === aPassword) {
            req.session.admin = aEmail
            res.redirect('/admin');
        } else {
            res.render('admin/login', { invalid: "invalid username or password" });
        }
    },
    adminLogout: (req, res) => {
        req.session.destroy()
        res.redirect('/admin')
    },
    getAllUsers: async (req, res) => {
        let users = await user.find();
        res.render('admin/userDetails', { users });
    },
    blockUser: async (req, res) => {
        const id = req.params.id;
        await user.updateOne({ _id: id }, { $set: { isBlocked: true } }).then(() => {
            res.redirect("/admin/userDetails")
        })
    },
    unblockUser: async (req, res) => {
        const id = req.params.id;
        await user.updateOne({ _id: id }, { $set: { isBlocked: false } }).then(() => {
            res.redirect('/admin/userDetails');
        })
    },
    addProduct: async (req, res) => {
        const category = await categories.find()
        res.render('admin/addProduct', { category: category });
    },

    postProduct: async (req, res) => {
        let categoryId = req.body.category;
        const image = req.files.product_image
        const product = new products({
            name: req.body.product_name,
            price: req.body.price,
            category: categoryId,
            description: req.body.description,
            stock: req.body.stock
        })
        const productDetails = await product.save()
        if (productDetails) {
            let productId = productDetails._id;

            image.mv('./public/adminImages/' + productId + '.jpg', (err) => {
                if (!err) {
                    res.redirect('/admin/productDetails')
                } else {
                    console.log(err)
                }
            })

        }
    },
    productDetails: async (req, res) => {
        const admin = req.session.admin
        if (admin) {
            const product = await products.find().populate('category')
            res.render('admin/productDetails', { product })
        }
    },         
    editProduct: async (req, res) => { 
        const id = req.params.id;

        const category = await categories.find()
        const productData = await products.findOne({ _id: id })
        res.render('admin/editProduct', { productData, category })
    },
    postEditProduct: async (req, res) => {
        const id = req.params.id;
        await products.updateOne({ _id: id }, {
            $set: { 
                name: req.body.name,
                price: req.body.price,
                category: req.body.category,
                description: req.body.description,
                stock: req.body.stock
            }
        });
        if (req?.files?.product_image) {
            const image = req.files.product_image;
            image.mv('./public/adminImages/' + id + '.jpg', (err) => {
                if (!err) {
                    res.redirect('/admin/productDetails')
                } else {
                    console.log(err)
                }
            })
        } else {
            res.redirect('/admin/productDetails')
        }

    },
    deleteProduct: async (req, res) => {
        const id = req.params.id;
        await products.updateOne({ _id: id }, { $set: { delete: true } })
        res.redirect('/admin/productDetails')

    },
    restoreProduct: async (req, res) => {
        const id = req.params.id;
        await products.updateOne({ _id: id }, { $set: { delete: false } })
        res.redirect('/admin/productDetails')

    },
    getCategory: async (req, res) => {
        const category = await categories.find();

        const categoryExist = req.session.categoryExist
        req.session.categoryExist = ""

        const editCategoryExist = req.session.editCategoryExist
        req.session.editCategoryExist = ""

        res.render('admin/category', { category, categoryExist, editCategoryExist });
    },
    addCategory: async (req, res) => {
        if (req.body.name) {
            const name = req.body.name
            const catgry = await categories.findOne({ category_name: name });
            if (catgry) {
                req.session.categoryExist = "category already exist";
                res.redirect('/admin/category')
            } else {
                const category = new categories({
                    category_name: req.body.name
                })
                await category.save()
                res.redirect('/admin/category');
            }
        } else {
            res.redirect('/admin/category')
        }
    },
    editCategory: async (req, res) => {
        if (req.body.name) {
            const name = req.body.name
            const id = req.params.id;
            const category = await categories.findOne({ category_name: name });
            if (category) {
                req.session.editCategoryExist = "Category already exist";
                res.redirect('/admin/category')
            } else {
                await categories.updateOne({ _id: id }, {
                    $set: {
                        category_name: req.body.name
                    }
                });
                res.redirect('/admin/category');
            }

        } else {
            res.redirect('/admin/category')
        }
    }
    ,
    deleteCategory: async (req, res) => {
        const id = req.params.id
        await categories.updateOne({ _id: id },{$set:{delete:true}})
        res.redirect('/admin/category')
    },
    restoreCategory:async (req,res)=>{
        const id = req.params.id
        await categories.updateOne({_id:id},{$set:{delete:false}})
        res.redirect('/admin/category');
    },
    getBannerPage:async(req,res)=>{
        const bannerData = await banner.find()
        console.log(bannerData);
        res.render('admin/banner',{bannerData});
    },
    addBanner:async(req,res)=>{
        try{
            await banner.create({
                offerType:req.body.offerType,
                bannerText:req.body.bannerText,
                couponName:req.body.couponName,  
            }).then((data)=>{
                res.redirect('/admin/getBanner')
            })
        }catch{
           console.error();
           res.render('user/error');
        }

    },
    editBanner:async(req,res)=>{ 
      try{
        const id = req.params.id;
        const editedData = req.body;
         console.log(editedData)
        await banner.updateOne(
            {_id:id},
            {
                offerType:editedData.offerType,
                bannerText:editedData.bannerText,
                couponName:editedData.couponName,    
            }
            ).then(()=>{
                res.redirect('/admin/getBanner');
            })
      }catch{
        console.error()
        res.render("user/error")
      }
    },
    deleteBanner:async(req,res)=>{
      try{
        const id= req.params.id;
        await banner.updateOne(
            {_id:id},
            {isDeleted:true}
        ).then(()=>{
            res.redirect('/admin/getBanner');
        })
      }catch{
        console.error();
        res.render("user/error");
      }
    },
    restoreBanner:async(req,res)=>{
      try{
        const id = req.params.id;
        await banner.updateOne(
            {_id:id},
            {isDeleted:false}
        ).then(()=>{
            res.redirect('/admin/getBanner');
        })
      }catch{
        console.error()
        res.redirect("/admin/getBanner");
      }
    },
    getCouponPage:async (req,res)=>{
      const couponData = await coupon.find()
      res.render('admin/coupon',{couponData});
    },
    addCoupon: (req,res)=>{
        try{
          const data = req.body;
          const dis  = parseInt(data.discount);
          const maxLimit = parseInt(data.maxLimit);
          const discount = dis/100;
          coupon.create({
            couponName:data.couponName,
            discount:discount,
            maxLimit:maxLimit,
            expirationTime:data.expirationTime,
          }).then((data)=>{
            // console.log(data);
            res.redirect("/admin/coupon")
          });
        }catch{
            console.error();
            res.render("user/error")
        }
    }, 
    deleteCoupon:async (req,res)=>{
        const id = req.params.id;
        await coupon.updateOne({_id:id},{$set:{delete:true}})
        res.redirect('/admin/coupon');
    },
    restoreCoupon:async(req,res)=>{
        const id = req.params.id;
        await coupon.updateOne({_id:id},{$set:{delete:false}});
        res.redirect("/admin/coupon");
    },
    editCoupon:async(req,res)=>{
        try{ 
        const id = req.params.id;
        const data = req.body;
        coupon.updateOne(
            {_id:id},
            {
                couponName:data.couponName,
                discount:data.discount/100,
                maxLimit:data.maxLimit,
                expirationTime:data.expirationTime
            }
        ).then(()=>{
            res.redirect("/admin/coupon");
        })
    }catch{
       console.error();
    }
    },
    getOrders: async(req,res)=>{
        order.aggregate([
            {
                $lookup:{
                    from:"products",
                    localField:"orderItems.productId",
                    foreignField:"_id",
                    as:"product"
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"userId",
                    foreignField:"_id",
                    as:"users"
                }
            },
            {
                $sort:{
                    createdAt:-1
                }
            }
        ]).then((orderDetails)=>{
            res.render("admin/orders",{orderDetails});
        })
    },
    getOrderedProduct:async (req,res)=>{
        const id = req.params.id;
        const objId = mongoose.Types.ObjectId(id)
        const productData = await order.aggregate([
            {
                $match:{_id:objId}
            },
            {
                $unwind:"$orderItems"
            },
            {
                $project:{
                    productItem:"$orderItems.productId",
                    productQuantity:"$orderItems.quantity",
                    address:1,
                    name:1,
                    phoneNumber:1  
                }
            },
            {
                $lookup:{
                    from:"products",
                    localField:"productItem",
                    foreignField:"_id",
                    as:"productDetail"
                }
            },
            {
                $project:{
                    productItem:1,
                    productQuantity:1,
                    address:1,
                    name:1,
                    phoneNumber:1,
                    productDetail:{$arrayElemAt:["$productDetail",0]}
                }
            },
            {
                $lookup:{
                    from:'categories',
                    localField:'productDetail.category',
                    foreignField:"_id",
                    as:"category_name"
                }
            },
            {
                $unwind:"$category_name"
            },

        ]);
        res.render('admin/orderedProduct',{productData})
    },
    orderStatusChanging:async (req,res)=>{
        const id = req.params.id;
        const data = req.body;
        await order.updateOne(
            {_id:id},
            {
                $set:{
                    orderStatus:data.orderStatus,
                    paymentStatus:data.paymentStatus,
                }
            }
        )
        res.redirect("/admin/order");
    }
}   
