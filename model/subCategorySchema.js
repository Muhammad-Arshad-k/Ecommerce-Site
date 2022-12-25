const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const subCategorySchema = new Schema({
    category_id:{ 
        type:mongoose.SchemaTypes.ObjectId,
        ref:'categories'
    },
    sub_category_name:{
        type:String,
        required:true
    }
})
const subCategory = mongoose.model('ubCategory',subCategorySchema);
module.exports= subCategory;