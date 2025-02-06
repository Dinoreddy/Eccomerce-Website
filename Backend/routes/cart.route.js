import express from "express"
import { protectedRoute } from "../middlewares/auth.middlewares.js";
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cartController.js";

const router = express.Router();

router.get("/",protectedRoute,getCartProducts);
router.post("/",protectedRoute,addToCart);
router.delete("/",protectedRoute,removeAllFromCart);
router.put("/:id",protectedRoute,updateQuantity);

export default router;