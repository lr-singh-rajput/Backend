import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

 export const verifyJWT  = asyncHandler(async(req,res,next)=>
{
   const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    //req.header("Authorization")  kyo ki mobile app me cookie nhi hoti hai wo header me send karega
    if(!token){
        throw new ApiError(
            401, "unauthorozed request"
        )
    }

    
}
)