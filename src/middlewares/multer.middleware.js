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


/*
import multer from "multer";
import path from "path";



const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/temp"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});
*/