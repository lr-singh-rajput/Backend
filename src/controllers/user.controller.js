  import {asyncHandler} from '../utils/asyncHandler.js';
  import{ApiError} from '../utils/ApiError.js'; 
  import { User } from '../models/user.model.js';
  import { uploadOnCloudinary } from '../utils/cloudinary.js';
  import { ApiResponse } from '../utils/ApiResponse.js';
  import jwt from 'jsonwebtoken';  




// generate token and save refresh token in mongoDB
  /* Cookie options (module-level):
   - `cookieOptionsDev`: for local development (HTTP, same-site requests).
   - `cookieOptionsProd`: for production hosting (HTTPS, cross-site cookie support).

  The code will pick `COOKIE_OPTIONS` based on `NODE_ENV` so both
  `loginUser` and `logoutUser` can use the same settings.
  */
  const cookieOptionsDev = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/'
  }

  const cookieOptionsProd = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/'
  }

  const COOKIE_OPTIONS = process.env.NODE_ENV === 'production' ? cookieOptionsProd : cookieOptionsDev;// module level constant 

  // generate access and refresh token function
const generateAccessAndRefreshToken = async(userId)=>
  {
try{
    const user = await User.findById(userId)

    // methods 
    const accessToken  = user.generateAccessToken()
    const refreshToken =  user.generateRefreshToken()

    //save refresh token in database
    user.refreshToken = refreshToken
     await user.save({validateBeforeSave: false}) // validation off not update pass and any field and not validation

    return {accessToken,refreshToken}

  } catch(error){
      throw new ApiError(500, "Something went wrong while generate referesh and Access token")
  }
}


// register user
  const registerUser = asyncHandler(async (req, res) => {
    // all steps 
    //1 get user details from frontend
    //2 validation - not empty
    //3 check if user already exists using email and userName
    //4 chacke for image ,chack for avtar
    //5 upload image to cloudinary, avatar
    //6 create user object - create entry in db
    //7 remove password and refresh token field from response
    //8 check for user creation success
    //9 return response to frontend



//Step 1: Get user details from frontend
    const {fullName, email,username,password}= req.body;
   //console.log('email: ',email)


   // Step 1: Check if fields exist

  /* if(!fullName || !email || !username || !password){
    res.status(400);
    throw new ApiError(400," All fields are required");
   }*/


   // Step 2: Check if fields are not empty strings
   if(
    [fullName,email,username,password].some((field) => 
      field.trim() === ''
    //  typeof field !== 'string' || field.trim() === ''
      )
   ){
    res.status(400);
    throw new ApiError (400, " All fields must be non-empty strings");
   }

    // Step 2: Validate email and all fields format 
   // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  


    // Step 3: Check if user already exists
     const existedUser =  await User.findOne({
      $or: [{email}, {username}]
   //   $or: [{email: email.toLowerCase()}, {username: username.toLowerCase()}]
  })

    if(existedUser){  
   //   res.status (409); // conflict
      throw new ApiError(409, "User with given email or username already exists");
    }


    // Step 4: Check for images only avtar is required

    // chack if avater and backegraund  file is present in local folder public/temp
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    /*

        const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

                  < ---- or ----->

      let coverImageLocalPath;
      if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
      }

    */

    // avater is required
if(!avatarLocalPath){  
  throw new ApiError(400, "Avater image is required");
}
    

    // Step 5: Upload images to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
   // console.log("Avatar upload response:" resonse,); // Debug log
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar){
      throw new ApiError(400, "Avatar file upload failed on cloudinary");
    }

    // Step 6: Create user object - create entry in db
    const user = await User.create({
      fullName,
      email,
      username: username,
      password,
      avatar: avatar?.url || "" ,
      coverImage: coverImage?.url || "",


      // username   
      //avater: avatar.secure_url,
      //coverImage: coverImage?.secure_url || '',
    });

// Step 7: Remove password and refresh token field from response
// check user are created successfully and not 
// not recommended way,mongoDB call increase
const createdUser = await User.findById(user._id).select(
  '-password -refreshTokens'  //this field are not included in response
);

if(!createdUser){
  throw new ApiError(500, "User creation failed ,Something went wrong while registering the user  ");
}

// Step 8: Return response to frontend
res.status(201).json(

new ApiResponse(
  201, 
  createdUser,
  'User registered successfully'
)   


  // message: 'User registered successfully',
  // user: createdUser,
);



   





  // res.status(200).json({
  //   message: 'User registered successfully',    

  // })
  }); 

  // login user
  const loginUser = asyncHandler(async (req, res) => {

  //1 req body -> data
  //2 USERNAME OR EMAIL
  //3 FIND THE USER 
  //4 PASSWORD CHECK
  //5 Access and refresh token
  //6 send cookie 
  

// Step 1 req body -> data  
  const {email,username,password} = req.body


  //Step 2 chack validation username or email
  // && dono hona chahiye 
  if(!username && !email){ 
    throw new ApiError(
      400,"username or  email is required"
    )
  }


  // here is an alternative if above code
  // || is condition me dono me se ek hona chahiye
  //  if(!username || !email){ 
  //   throw new ApiError(
  //     400,"username or  email is required"
  //   )
  // }

  // Step 3 find the user {username or email}
 const user = await User.findOne({
  $or:[{username},{email}]
})

if (!user){
  throw new ApiError(
    404,
    "User does not exist"
  )
}

  // Step 4 Chackn The Password 
  //User ->  mongoos {mongoDB(database)} data 
  //user -> user send login request - this data  
  
  
  const isPasswordvalid  = await user.isPasswordCorrect(password ) // this pass user send in login request (user)


if (!isPasswordvalid){
  throw new ApiError(
    401,
    "Invalid user credentials"
  )
}

// Step 5 Access A Refresh Token generate 
const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)


// Step 6  send cookie 

// step 3 me user hai us ke pass refresh tokan nhi hai  ya to update kare ya new user query dale or data mangwaye
// hamere pass step 3 wale user ka hi refrensh hai abhi
// agar database par query karna expensive hai to  ise update kar 
// agar mhi hai to findById karke new user mangwa le 

const loggedInUser  = await User.findById(user._id)
                      .select(" -password -refreshTokens") // ye dono nhi jayegi field request me

//  ye shirf server se hi modify hogi frontent se nhi  
/* Cookie options (both kept here):
 - `cookieOptionsDev`: for local development (HTTP, same-site requests).
 - `cookieOptionsProd`: for production hosting (HTTPS, cross-site cookie support).

When hosting in production (frontend may be on different origin):
 - Use `cookieOptionsProd` (secure: true, sameSite: 'none').
 - Ensure your site uses HTTPS and client requests include credentials.

When developing locally (http://localhost):
 - Use `cookieOptionsDev` (secure: false, sameSite: 'lax') so the browser sends cookies over HTTP.

Runtime selection below automatically chooses the correct options based on `NODE_ENV`.
*/
// use module-level COOKIE_OPTIONS declared above

return res
.status(200)
// set accesToken and refreshToken in cookie 
.cookie("accessToken", accessToken, COOKIE_OPTIONS)
.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
.json(
  new ApiResponse(
    200,
    {
      user: loggedInUser,accessToken,refreshToken
      // accessToken,refreshToken send for user save in local storage 
      // and mobile Application not set cookie 
    },
    "User logged In Successfully"
  )
)


})


// logOut User
const logoutUser = asyncHandler (async(req,res)=>{

  //1 cookie reset
  //2 generateAccessAndRefreshToken reset

   await User.findByIdAndUpdate(
    req.user._id,
      {
        $set:{
          refreshTokens: undefined
        }
      },
      {
        new: true
      }

  // req.user._id,// from verifyJWT middleware
    // {refreshTokens: null}, // remove refresh token from db
    // {new: true} // return updated user 
   )
    // Step 1 cookie reset
    // Explicitly expire cookies (helps some clients and tools like Postman)
    res.cookie("accessToken", "", { ...COOKIE_OPTIONS, maxAge: 0 })
    res.cookie("refreshToken", "", { ...COOKIE_OPTIONS, maxAge: 0 })
    res.clearCookie("accessToken", COOKIE_OPTIONS) // remove access token ,options for secure and httpOnly
    res.clearCookie("refreshToken", COOKIE_OPTIONS) // remove refresh token 

    // Prepare debug info (only include sensitive user info in dev or when explicitly requested)
    const logoutInfo = {};
    if (process.env.NODE_ENV !== 'production' || req.query?.debug === 'true') {
      logoutInfo.user = {
        _id: req.user?._id,
        email: req.user?.email,
        username: req.user?.username
      };
    }

    // Log to server console to help debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('Logout executed for user:', logoutInfo.user || { id: req.user?._id });
      console.log('COOKIE_OPTIONS used:', COOKIE_OPTIONS);
      console.log('Set-Cookie headers about to be sent:', res.getHeader('Set-Cookie'));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          logoutInfo,
          "User logged out successfully"
        )
      )

     



     

   
})



// refreshAndAccessToken gerate new acces token
  const refreshAccessToken = asyncHandler(async(res,req)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken


    if(!incomingRefreshToken){
      throw new ApiError(401,"unauthorized required")
    }
try {
  
       const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          )
  
          const user = await User.findById(decodedToken?._id)
  if(!user){
    throw new ApiError(401,"unauthorized user not found")
  }
  
  
  if (incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(
      401,
      "Refresh token is expired or used"
    )
  }
  
  const options ={
  httpOnly : true,
  //secure: true
  
  }
  
  const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
  return res.status(200)
            .cookie("accessToken",accessToken,options )
            .cookie("refreshToken", newRefreshToken , options)
            .json(
              new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token refeshed , genrated new token"
              )
            )
} catch (error) {
  throw new ApiError(401, error?.message || "Invalid refresh token")
}
})
      

export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}

