

//Promise based error handler for async functions 

const asyncHandler = (requestHandler) => {
   return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
    .catch((err) => next(err));
    }
}   

export {asyncHandler}

//  


//try catch wrapper for async functions to handle errors 
// const asyncHandler = (fn) => async function (req, res, next) {
//  

//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.stutas(error.code || 500).json({
//             success: false,
//             message: error.message || "Internal Server Error"
//         })
//     }


// };