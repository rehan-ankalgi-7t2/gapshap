import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _, next) => {
    try {
        const token = await (req.cookies?.AccessToken ||
            req.header("Authorization")?.replace("Bearer ", ""));
        // console.log("toekn:", token);

        if (!token) {
            throw new ApiError(401, "Unauthorised request");
        }

        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decode?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "not authorized! token failed");
    }
});