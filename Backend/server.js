import express from "express"
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js"
import productRoute from "./routes/products.route.js"
import cartRoute from "./routes/cart.route.js"
import couponRoute from "./routes/coupon.route.js"
import paymentRoute from "./routes/payment.route.js"
import analyticsRoute from "./routes/analytics.route.js"    
import cookieParser from "cookie-parser";
import cors from "cors"
import { MonogoDB } from "./lib/db.js";
import path from "path";

const app = express();
dotenv.config();

const __dirname = path.resolve();
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE',"PATCH"], // Allowed HTTP methods
    credentials: true, // If you need to include cookies or authentication headers
  }));
  


app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use("/api/auth",authRoute)
app.use("/api/products",productRoute)
app.use("/api/cart",cartRoute)
app.use("/api/coupons",couponRoute)
app.use("/api/payments",paymentRoute)
app.use("/api/analytics",analyticsRoute)
const PORT = process.env.PORT || 5000

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"/frontend/dist")));

    app.get("*",(req,res)=>{
      res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))

    })
}

app.listen(5000,()=>{
    console.log(`server running on port ${PORT} `)

    MonogoDB()
})