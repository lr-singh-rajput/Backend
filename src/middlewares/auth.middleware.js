import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";   
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";




// chack and verify jwt token middleware
// chack user is logIn or not , attach user to request object 
// use logout,like ,comment,create post routes and etc 

// _ --> res
 export const verifyJWT  = asyncHandler(async(req,_,next)=> // _ --- ignore res
{try {
    
       const token =  req.cookies?.accessToken || req.header
       ("Authorization")?.replace("Bearer ", "")
        //req.header("Authorization")  kyo ki mobile app me cookie nhi hoti hai wo header me send karega
        if(!token){
            throw new ApiError(
                401, "unauthorozed request"
            )
        }
    
            
        const decodedToken = await jwt.verify(token,process.env.
            ACCESS_TOKEN_SECRET)
    
             const user =   await User.findById(decodedToken?._id).
                    select("-password -refreshTokens") // exclude password and refresh token
             if(!user){
                throw new ApiError(
                    401, "Invalid Access Token ,unauthorozed request no user found"
                )
             }
    
    
             req.user = user // attach user to request object
             next() // proceed to next middleware or route handler
} catch (error) {
    throw new ApiError(
        401, 
        error?.message || 
        "Invalid Access Token ,unauthorozed request"
    )    
}

    })