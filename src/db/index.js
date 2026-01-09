import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connectDB = async () => {
  try {
   const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to MongoDB, connection successful.");

    // only for checking connection and andestending and increase noleage of connections
    console.log (` \n MongoDB connected !! DB Host : MongoDB connection host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB connection faild  check error:", error);
    process.error(1);
    throw error;
  }     
};



export default connectDB;