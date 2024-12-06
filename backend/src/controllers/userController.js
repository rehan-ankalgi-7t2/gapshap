import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../services/cloudinaryService.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

/**
 *
 * @param {*} userID
 * @returns
 */
const generateAccessAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // console.log(`access token: ${accessToken}, refresh token: ${refreshToken}`);

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh token"
        );
    }
};

/**
 *
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
    res.send("All users");
});

/**
 *
 */
const registerUser = asyncHandler(async (req, res) => {
    /**
     * @logic
     * -> get user details from frontend
     * -> validate the user data
     * -> check if the user already exists in the db: check with username and email
     * -> check the image files: validate avatar* and cover image
     * -> upload image files to cloudinary: check if the files have been uploaded to cloudinary: avatar*
     * -> create user object - for the entry in db
     * -> remove password and refreshToken fields from the response
     * -> check for user creation
     * -> return the response
     */

    const { username, fullName, email, password } = req.body;

    if (
        [fullName, username, email, password].some(
            (fields) => fields?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existingUser) {
        throw new ApiError(409, "User with this username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(res.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatarUploadResponse = await uploadFileOnCloudinary(avatarLocalPath);
    const coverImageUploadResponse =
        await uploadFileOnCloudinary(coverImageLocalPath);
    if (!avatarUploadResponse) {
        throw new ApiError(400, "avatar is required");
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatarUploadResponse.url,
        coverImage: coverImageUploadResponse?.url || "",
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

/**
 *
 */
const loginUser = asyncHandler(async (req, res) => {
    /**
     * @Logic
     * -> destructure user details from the request
     * -> validate the details
     * -> find th euser in the db
     * -> check password
     * -> if true
     * -> generate access toekn and refresh token
     * -> send tokens in secure HTTP only cookies
     * -> log the user in
     */

    const { email, username, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (!existingUser) {
        throw new ApiError(404, "User does not exists");
    }

    const isPasswordValid = await existingUser.matchPasswords(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "user credentials is not valid");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        existingUser._id
    );

    const loggedInUser = await User.findById(existingUser._id).select(
        "-password -refreshToken"
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("AccessToken", accessToken, cookieOptions)
        .cookie("RefreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

/**
 *
 */
const logUserOut = asyncHandler(async (req, res) => {
    /**
     * @logic
     * -> clear cookies
     * -> clear refreshToken
     * -> send relevant response
     */

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("AccessToken", cookieOptions)
        .clearCookie("RefreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "user logged out successfully"));
});

/**
 *
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.RefreshToken || req.body.RefreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token has expired or already used");
        }

        const cookieOptions = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
            user?._id
        );

        // console.log("new refresh token", refreshToken);

        return res
            .status(200)
            .cookie("AccessToken", accessToken, cookieOptions)
            .cookie("RefreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access Token Refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message);
    }
});

/**
 *
 */
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPAsswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError();
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: true });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully")));

/**
 * Tip: always have a different endpoint to update any file on the server to reduce network congestion
 */
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, fullName } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email, // either way can be used
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(200, { user }, "Account Details updated successfully")
        );
});

/**
 *
 */
const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar image file is missing");
    }

    const avatar = await uploadFileOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar");
    }
    // console.log("found the avatar local path");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "avatar image updated successfully"));
});

/**
 *
 */
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image file is missing");
    }

    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, { user }, "cover image updated successfully"));
});



export {
    getAllUsers,
    registerUser,
    loginUser,
    logUserOut,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateUserCoverImage,
};