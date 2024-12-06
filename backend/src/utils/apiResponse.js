/**
 * @description:
 * a simple ApiResponse class that represents the response structure for successful API responses.
 */
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        // Assign values to properties
        this.statusCode = statusCode; // HTTP status code
        this.message = message; // Response message (default is "Success")
        this.success = statusCode < 400; // Determine if the response is successful based on the status code
        this.data = data; // The actual data payload of the response
    }
}

export { ApiResponse };