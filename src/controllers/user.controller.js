  import {asyncHandler} from '../utils/asyncHandler.js';
  import{ApiError} from '../utils/ApiError.js'; 
  import { User, User } from '../models/user.model.js';
  import { uploadOnCloudinary } from '../utils/cloudinary.js';
  import { ApiResponse } from '../utils/ApiResponse.js';




// generate token and save refresh token in mongoDB
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
const loginUser = asyncHandler(async(res,req)=>{

  //1 req body -> data
  //2 USERNAME OR EMAIL
  //3 FIND THE USER 
  //4 PASSWORD CHECK
  //5 Access and refresh token
  //6 send cookie 
  

// Step 1 req body -> data  
  const {email,username,password} = req.body


  //Step 2 chack validation username or email
  if(!username || !email){
    throw new ApiError(
      400,"username or  email is required"
    )
  }

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
const options = {
    httpOnly : true,
    secure: true
  }                    

return res
.status(200)
// set accesToken and refreshToken in cookie 
.cookie("accesToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
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
   const options = {  // cookie options 
    httpOnly : true, // client side script access nhi kar sakta
    secure: true // only send over https
  }    

  return res
  .status(200)
  // .cookie("accessToken","",{...options, maxAge:0}) // remove cookie ,maxAge 0 kar do 
  // .cookie("refreshToken","",{...options, maxAge:0}) // maxAge 0 kar diye kyo ki cookie ko empty string de diya hai
  .clearCookie("accessToken", options) // remove access token ,options  for secure and httpOnly,not modifiable from client side script
  .clearCookie("refreshToken", options) // remove refresh token 
  .json(
    new ApiResponse(
      200,
      {},
      "User logged out successfully"
    )
  )

     



     

   
})

export { 
  registerUser,
  loginUser,
  logoutUser
};
