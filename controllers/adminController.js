require('dotenv').config()
const user = require('../model/userSchema');
const products = require('../model/productSchema');
const categories = require('../model/categorySchema')

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
            res.redirect('/admin/home')
        }else{
            res.redirect('/admin');
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
        addProduct:(req,res)=>{
            res.render('admin/addProduct');
        },
        
        postProduct:async(req,res)=>{
            const image = req.files.pImage
            const product = new products({ 
                 name:req.body.name,
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
             
            const productData = await products.findOne({_id:id})
            res.render('admin/editProduct',{productData})
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
            await products.deleteOne({_id:id}).then(()=>{
                res.redirect('/admin/productDetails')
            })
        },
        
}
