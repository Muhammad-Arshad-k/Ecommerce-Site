require('dotenv').config()
const user = require('../model/userSchema');
const products = require('../model/productSchema');
const categories = require('../model/categorySchema');
const aEmail  = process.env.ADMIN_EMAIL
const aPassword = process.env.ADMIN_PASSWORD

module.exports={
    getAdminLogin:(req,res)=>{
        const admin=req.session.admin
        if(admin){
            res.render('admin/home')
        }else{
            res.render('admin/login')
        }
    },
    getAdminHome:(req,res)=>{
    const admin= req.session.admin
    if(admin){
        res.render('admin/home');
    }else{
        res.render('admin/login');
     }
    },
    postAdminLogin:(req,res)=>{
        if(req.body.email === aEmail && req.body.password=== aPassword){
            req.session.admin = aEmail
            res.redirect('/admin');
        }else{
            res.render('admin/login',{invalid:"invalid username or password"});
        }
      },
      adminLogout:(req,res)=>{
        req.session.destroy()
        res.redirect('/admin')
      },
      getAllUsers:async(req,res)=>{
        const admin = req.session.admin

            if(admin){
                const users  = await user.find()
                res.render('admin/userDetails',{users})
            }else{
                res.redirect('/admin');
            }
        },
        blockUser :async (req,res)=>{
            const id = req.params.id;
            await user.updateOne({_id:id},{$set:{isBlocked:true}}).then(()=>{
                res.redirect("/admin/userDetails")
            })
        },
        unblockUser:async (req,res)=>{
            const id = req.params.id;
            await user.updateOne({_id:id},{$set:{isBlocked:false}}).then(()=>{
                res.redirect('/admin/userDetails');
            }) 
        },
        addProduct:async(req,res)=>{
            const category = await categories.find()
            res.render('admin/addProduct',{category:category});
        },
        
        postProduct:async(req,res)=>{
            const image = req.files.product_image
            const product = new products({ 
                 name:req.body.product_name,
                 price:req.body.price,
                 category:req.body.category,
                 description:req.body.description, 
                 stock:req.body.stock
            })
            const productDetails = await product.save()
          if(productDetails){
            let productId = productDetails._id;
        
            image.mv('./public/adminImages/'+productId+'.jpg',(err)=>{
                if(!err){
                    res.redirect('/admin/productDetails')
                }else{
                    console.log(err)
                }
            } )
          
          }
        },
        productDetails:async (req,res)=>{
         const admin = req.session.admin
         if(admin){
            const product = await products.find()
            res.render('admin/productDetails',{product})
         }
        },
        editProduct:async(req,res)=>{
            const id = req.params.id;

            const category = await categories.find()
            const productData = await products.findOne({_id:id})
            res.render('admin/editProduct',{productData,category})
        },
        postEditProduct:async(req,res)=>{
            const id = req.params.id;
            await products.updateOne({_id:id},{$set:{
                name:req.body.name,
                price:req.body.price,
                category:req.body.category,
                description:req.body.description,
                stock:req.body.stock
            }});
            if(req?.files?.product_image){
                const image = req.files.product_image;

                image.mv('./public/adminImages/'+id+'.jpg',(err)=>{
                    if(!err){
                        res.redirect('/admin/productDetails')
                    }else{
                        console.log(err)
                    }
                })
            }else{
                res.redirect('/admin/productDetails')
            }
           
        },
        deleteProduct:async(req,res)=>{
            const id = req.params.id;
            await products.updateOne({_id:id},{$set:{delete:true}}).then(()=>{
                res.redirect('/admin/productDetails')
            })
        },
        restoreProduct:async (req,res)=>{
            const id = req.params.id;
            await  products.updateOne({_id:id},{$set:{delete:false}}).then(()=>{
                res.redirect('/admin/productDetails')
            })
        },
        getCategory:async(req,res)=>{
            const admin = req.session.admin
            if(admin){
                const category = await categories.find();
                let submitErr = req.session.submitErr

                 
                res.render('admin/category',{category,submitErr});

            }else{
                res.redirect('/admin')
            }
        },
        addCategory:async(req,res)=>{
            if(req.body.name){
                const name = req.body.name
                const catgry = await categories.findOne({category_name:name});
                if(catgry){
                    //must pass message
                    res.redirect('/admin/category')
                }else{
                    const category = new categories({
                         category_name:req.body.name
                    })
                    await category.save()
                    res.redirect('/admin/category');
                }
            }else{
                req.session.submitErr = "oops some data missing!"
                res.redirect('/admin/category')
            }
        },
        editCategory:async(req,res)=>{ 
            if(req.body.name){
                const name = req.body.name
                const findName = await categories.findOne({category_name:name});
                if(!findName){
                    const id = req.params.id;
                    await categories.updateOne({_id:id},{$set:{
                        category_name:req.body.name

                    }})
                    res.redirect('/admin/category')
                }else{
                    res.redirect('/admin/category')
                }
            }else{
                res.redirect('/admin/category');
            }
            
        },
        deleteCategory:async(req,res)=>{
            const id = req.params.id
            console.log(id);
            await categories.deleteOne({_id:id})
              res.redirect('/admin/category')
        }
}  
