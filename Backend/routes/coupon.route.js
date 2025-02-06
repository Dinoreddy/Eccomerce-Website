import express from "express";
import { protectedRoute } from "../middlewares/auth.middlewares.js";
import { getCoupon, validateCoupon } from "../controllers/couponController.js";

const router = express.Router();

router.get("/",protectedRoute,getCoupon);
router.post("/validate",protectedRoute,validateCoupon)
export default router;