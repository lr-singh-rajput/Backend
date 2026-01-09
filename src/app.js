import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';



const app = express()

app.use(cors({

    origin: process.env.CORS_ORIGIN,
    credentials: true,

}))

app.use(express.json({limit: "16mb"})) // to parse json data with size limit of 16mb
app.use(express.urlencoded({ extended: true, limit: '16mb' })  );// to parse form data, extended understands nested objects
app.use(express.static('public')); // to serve static files from public folder 
app.use(cookieParser()) // to parse cookies from incoming requests


// routes declaration 
import userRoute from './routes/user.routes.js';
app.use('/api/v1/users', userRoute);

export { app }