import express from "express"
import { createProduct, deleteProduct, featuredProducts, getAllProducts, getProductsByCategory, getRecommendedProducts, toggleFeaturedProducts } from "../controllers/productsController.js"
import { protectedRoute,adminRoute } from "../middlewares/auth.middlewares.js"
const router = express.Router()

router.get("/",protectedRoute,adminRoute,getAllProducts);
router.get("/featured",featuredProducts);
router.get("/recommended",getRecommendedProducts);
router.get("/category/:category",getProductsByCategory);
router.post("/",protectedRoute,adminRoute,createProduct);
router.patch("/:id",protectedRoute,adminRoute,toggleFeaturedProducts)
router.delete("/:id",protectedRoute,adminRoute,deleteProduct);

export default router