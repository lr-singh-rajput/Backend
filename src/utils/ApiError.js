
class ApiError extends Error {
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
        statck = ""
    
    ) {
        super(message); 
        this.statusCode = statusCode;
        this.data = null
        this.message = message;
        this.success = false;
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        }else {
            Error.captureStackTrace(this, this.constructor);
        }

        // this.stack = statck;
        // this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        // this.isOperational = true;  
        // Error.captureStackTrace(this, this.constructor);
    }       

}
//  

export { ApiError } 