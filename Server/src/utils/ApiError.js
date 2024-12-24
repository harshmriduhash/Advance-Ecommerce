class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        stack=""
    ){
        // over write kr rhe 
        super(message) 
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success=false  //indicate it is a filure
        this.errors=errors  //Assigns the provided errors array to the instance
        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export default ApiError