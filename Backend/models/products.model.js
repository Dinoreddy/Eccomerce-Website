import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Name is required"],
    }, 
    description: {
        type: String,
        required: [true,"Description is required"],
    },
    price: {
        type: Number,
        required: [true,"Price is required"],
        min:0
    },
    image:{
        type: String,
        required:[true,"Image is Required"]
    },

    category:{
        type:String,
        required:true
    },

    isFeatured:{
        type:Boolean,
        default:false
    }
    }
    ,{timestamps:true})

const Products = mongoose.model("Product",productSchema)

export default Products;