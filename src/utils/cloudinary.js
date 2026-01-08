import {v2 as cloudinary} from 'cloudinary'; 
import fs from "fs"



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME , //Cloudinary cloud name
    api_key: process.env.CLOUDINARY_API_KEY ,//Cloudinary api key
    api_secret: process.env.CLOUDINARY_API_SECRET ,//Cloudinary api secret
});


const uploadOnCloudinary =  async (localFilePath) => {// function to upload file on cloudinary

    try{
        if(!localFilePath) return null;// if local file path is not provided return null
                //upload the file on cloudinary
                // resource_type: 'auto' -> to upload all type of files like image, video, etc.

        const response = await cloudinary.uploader.upload(localFilePath, {  // upload file to cloudinary
            resource_type: 'auto',  // upload all type of files
        }); // file has been uploaded successfully on cloudinary
        console.log('file is uploaded on cloudinary ', response.url);  // log the url of the uploaded file

        fs.unlinkSync(localFilePath) // remove the locally saved temporary file after uploading on cloudinary
        return response;    // return the response received from cloudinary after successful upload
    
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;  // return null in case of any error during upload
    } 
}



export { uploadOnCloudinary }  // export the function to be used in other files