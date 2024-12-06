import express, { Router } from "express";
import {
    getAllUsers,
    registerUser,
    logUserOut,
    loginUser,
    refreshAccessToken,
    getCurrentUser,
    updateAvatar,
    updateAccountDetails,
    updateUserCoverImage,
} from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/").get(getAllUsers); // working ✅
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
); // working ✅

router.route("/login").post(loginUser); // working ✅

// protected (secure) routes
router.route("/logout").post(protect, logUserOut); // working ✅
router.route("/refresh-token").post(refreshAccessToken); // working ✅
router.route("/profile").get(protect, getCurrentUser); // working ✅
router.route("/update-details").patch(protect, updateAccountDetails); // working ✅
router
    .route("/update-avatar")
    .patch(protect, upload.single("avatar"), updateAvatar); // working ✅
router
    .route("/update-cover")
    .patch(protect, upload.single("coverImage"), updateUserCoverImage); // working ✅


export default router;