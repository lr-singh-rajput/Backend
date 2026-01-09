import multer from "multer";


// Configure multer storage settings
const storage = multer.diskStorage({
    destination :function (req, file, cb){
        cb (null, './public/temp'); // specify the destination directory for uploaded files
    },
    filename: function (req, file, cb){
        cb(null ,file.originalname); // specify the filename for uploaded files
     //   cb(null , Date.now() + '-' + file.originalname); // specify the filename for uploaded files

    }
});
    
export const upload = multer({storage,})