import cloudinary from "../lib/cloudinary.js";
import Products from "../models/products.model.js";
import redis from "../lib/redis.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Products.find({});
    if (!products) {
      return res.status(404).json({ message: "No Product Found!!" });
    }

    return res.send(products);
  } catch (error) {
    return res.status(501).json({
      message: "Error in get all products controller",
      error: error.message,
    });
  }
};

export const featuredProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    featuredProducts = await Products.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({ message: "No Featured Product Found!!" });
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts));
    return res.json(featuredProducts);
    console.log("featuredProducts", featuredProducts);
  } catch (error) {
    console.log("error in getting featured products" + error.message);
    res.status(500).json({
      message: "Error in getting featured products",
      error: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    console.log(req.body);
    let cloudinaryResponse=null
    if (image) {
       cloudinaryResponse = await cloudinary.uploader.upload(image,{folder:"products"});
       console.log(cloudinaryResponse?.secure_url);
    }
    const product = new Products({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    await product.save();
    res.status(201).json({ product , message:"Product created successfully"});
  } catch (error) {
    console.log("error in creating product" + error.message);
    res.status(500).json({
      message: "Error in creating product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
   const product = await Products.findById(req.params.id);
   if(!product){
    return res.status(404).json({message:"Product not found"})
   }
   if(product.image){
    const publicId = product.image.split("/").pop().split(".")[0];
    try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image Deleted from Cloudinary");
    } catch (error) {
        console.log("error deleting image from cloudinary" + error.message);
    }
   }

   await Products.findByIdAndDelete(req.params.id);
   res.status(200).json({message:"Product deleted successfully"});
}catch(error){
    console.log("error in deleting product" + error.message);
    res.status(500).json({
        message: "Error in deleting product",
        error: error.message,
    });

}

}

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Products.aggregate([
            {
                $sample: { size: 3 }
            },
            {
                $project: {
                    _id:1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                    
                }
            }
        ])

        return res.json(products)
    } catch (error) {
        console.log("error in getting recommended products" + error.message);
        return res.status(500).json({
            message: "Error in getting recommended products",
            error: error.message,
        })
    }
}

export const getProductsByCategory = async (req, res) => {
    const {category} = req.params;
    try {
        const products = await Products.find({category})
        if(!products){
            return res.jsonn({message:`No products of category ${category} found!`})
        }
        return res.json({products})
    } catch (error) {
        console.log("error in getting products by category" + error.message);
        return res.status(500).json({
            message: "Error in getting products by category",
            error: error.message,
        })
    }
}

export const toggleFeaturedProducts = async (req, res) => {
    try {
        const product = await Products.findById(req.params.id);
        if(product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            return res.json(updatedProduct)
        }else{
            return res.status(404).json({message:"Product not found"})
        } 
    } catch (error) {
        console.log("error in toggling featured products" + error.message);
        return res.status(500).json({
            message: "Error in toggling featured products",
            error: error.message,
        })
    }
}

async function updateFeaturedProductsCache(){
  try{
    const featuredProducts = await Products.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  }catch(error){
    console.log("Error in updating featured products cache" + error.message);
  }
}