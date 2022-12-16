const user = require('../model/userSchema');
const products = require('../model/productSchema');
const categories = require('../model/categorySchema');
const order = require('../model/orderSchema');
const mongoose = require("mongoose");
const moment = require("moment");
moment().format();


module.exports = {
    getAdminLogin: (req, res) => {
        const admin = req.session.admin
        if (admin) {
            res.render('admin/home')
        } else {
            res.render('admin/login')
        }
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
        await categories.updtaeOne({ _id: id },{$set:{delete:true}})
        res.redirect('/admin/category')
    },
    restoreCategory:async (req,res)=>{
        await categories.updateOne({_id:id},{$set:{delete:false}})
        res.redirect('/admin/category');
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
