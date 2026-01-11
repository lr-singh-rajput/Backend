import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
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

 
//  secured reutes
// logOtut user
router.route('/logout').post( verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;