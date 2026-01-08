import mongoose ,{Schema} from 'mongoose';  
import jwt from 'jsonwebtoken'; // to generate tokens
import bcrypt from 'bcryptjs'; // normal text pass to hash passwords


const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // for faster search beter option 
        },
    fullName: {
        type: String,
        required: true,
        trim: true,

        },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        },

        avater: {
            type: String,// cloudinary url profile picture 
         //   default: '',
            required: true,
        },
        coverImage: {
            type: String,// cloudinary url profile picture 
            //default: '',
    
        },

        watchHistory: [    // array of video ids
                { 
                type: Schema.Types.ObjectId,
                 ref: 'Video' 
                }
            ],
        
            password: {
                type: String,
                required: [true, 'Password is required'],
              //
                minlength: [6, 'Password must be at least 6 characters long'], 
                },
            refreshTokens: {
                type: String,
            }, // for refresh token storage
}, {timestamps: true});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);// password hashing īn 10 rounds
        next();  // proceed to save
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // compare hashed passwords
}       


// method to generate jwt token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { 
            userId: this._id, 
            email: this.email,
            username: this.username,
            fullName: this.fullName
         },  // payload data ,
         //  add more if needed | less data better performance
        process.env.ACCESS_TOKEN_SECRET,
        { 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY

         } // token valid for 1 hour
    );

};

// method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
   return jwt.sign(
        { 
            userId: this._id, 
           
         },  // payload data ,
        process.env.REFRESH_TOKEN_SECRET,
        { 
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY 

         } // token valid for 10 day 
    );

};  



export const User = mongoose.model('User', userSchema);


//COLLECTION NAME MONGOOSE WILL CREATE plural form 'users' IN MONGODB DATABASE
// LIKE - User -----> users 
// automatically handled by mongoose
