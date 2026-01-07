import dotenv from "dotenv";

import connectDB from "../db/index.js"; 


dotenv.config({
    path : "./env"
});



connectDB();






/*  Setup Express Server   - basic setup  

import express from "express";
const app = express();

(async (
    async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            app.on("error", (error) => {
                console.error("Error connecting to MongoDB:", error);
                throw error;
            });
            console.log("Connected to MongoDB");

            app.listen(process.env.PORT, () => {
                console.log(`Server is running on port ${process.env.PORT}`);
            });

        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
    }
))()
    */