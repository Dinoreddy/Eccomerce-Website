import express from "express"
import { Login ,SignUp,Logout,refreshToken, getProfile} from "../controllers/authController.js";
import { protectedRoute } from "../middlewares/auth.middlewares.js";
const router = express.Router();

router.post("/signup",SignUp)
router.post("/login",Login)
router.post("/logout",Logout)
router.post("/refreshToken",refreshToken)
router.get("/getprofile",protectedRoute,getProfile)

export default router;