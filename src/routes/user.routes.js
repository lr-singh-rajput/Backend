import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// register router
router.route('/register').post(upload.fields([
    {
         name: 'coverImage',
          maxCount: 1 
        },
    {
         name: 'avatar',
          maxCount: 1 
        }
   ]),registerUser);


// login router
router.route('/login').post(loginUser);

// logOtut user
router.route('/logout').post( verifyJWT, logoutUser);


export default router;