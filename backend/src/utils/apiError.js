/**
 * @description a custom ApiError class that extends the built-in JavaScript Error class.
 *
 * This custom error class allows you to create instances of ApiError with additional properties like statusCode, data, message, success, and errors.
 */

/**
 * @usage
 */
/*
try {
  // Code that might throw an error
} catch (error) {
  // Handle the error by creating an ApiError instance
  const apiError = new ApiError(500, "Internal Server Error", [error.message]);
  // Optionally, you can set additional properties like apiError.data or apiError.success
  // Throw the ApiError instance to propagate the error with additional information
  throw apiError;
}
*/

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong!",
        errors = [],
        stack = ""
    ) {
        // Call the constructor of the parent class (Error)
        super(message);

        // Assign values to properties
        this.statusCode = statusCode; // HTTP status code
        this.data = null; // Additional data (set to null by default)
        this.message = message; // Error message
        this.success = false; // Indicate whether the operation was successful
        this.errors = errors; // Array of error details

        // Set the stack trace
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the ApiError class
export { ApiError };