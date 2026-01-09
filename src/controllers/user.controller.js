  import {asyncHandler} from '../utils/asyncHandler.js';
  import{ApiError} from '../utils/ApiError.js'; 
  import { User } from '../models/user.model.js';
  import { uploadOnCloudinary, uploadToCloudinary } from '../utils/cloudinary.js';
  import { ApiResponse } from '../utils/ApiResponse.js';



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
     existedUser = User.findOne({
      $or: [{email}, {username}]
   //   $or: [{email: email.toLowerCase()}, {username: username.toLowerCase()}]
  })

    if(existedUser){  
   //   res.status (409); // conflict
      throw new ApiError(409, "User with given email or username already exists");
    }


    // Step 4: Check for images only avtar is required

    // chack if avater and backegraund  file is present in local folder public/temp
    const avatarLocalPath = req.files?.avater[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // avater is required
    if(!avatarLocalPath){ 
      //res.status(400);
      throw new ApiError(400, "Avater image is required");
    }

    // Step 5: Upload images to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar){
      throw new ApiError(400, "Avater file is required");
    }

    // Step 6: Create user object - create entry in db
    const user = await User.create({
      fullName,
      email,
      username: username.lowercase(),
      password,
      avater: avatar.url,
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
export { registerUser };
