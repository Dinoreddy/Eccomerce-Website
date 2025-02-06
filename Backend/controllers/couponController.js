import { Coupon } from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({userId:req.user._id,isActive:true});
        res.json(coupon||null);
    } catch (error) {
        console.log("error in getting coupon" + error.message);
        return res.status(500).json({
            message: "Error in getting coupon",
            error: error.message,
        });
    }
}

export const validateCoupon= async (req, res) => {
    try {
        const {code}=req.body;
        console.log("Coupon controller",code ,req.user._id);
        const coupon = await Coupon.findOne({code:code,userId:req.user._id,isActive:true});

        if(!coupon){
            return res.status(404).json({message:"Coupon not found"});
        }

        if(coupon.expirationDate<new Date()){
            coupon.isActive=false;
            await coupon.save();
            return res.status(404).json({message:"Coupon expired"});
        }

        res.json({
            message:"Coupon valid",
            code:coupon.code,
            discountPercentage:coupon.discountPercentage
        })
    } catch (error) {
        console.log("error in validating coupon" + error.message);
        return res.status(500).json({
            message: "Error in validating coupon",
            error: error.message,
        });
    }
}