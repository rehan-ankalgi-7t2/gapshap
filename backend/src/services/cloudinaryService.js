import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: "rehocloud",
    api_key: "316812684982691",
    api_secret: "IYJm2_Iqg4xrxNxlVdNKR6m1O5M",
});

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const uploadFileOnCloudinary = async (localFilePath) => {
    //   console.log(process.env.CLOUDINARY_CLOUD_NAME);
    //   console.log(process.env.CLOUDINARY_API_KEY);
    //   console.log(process.env.CLOUDINARY_API_SECRET);
    try {
        if (!localFilePath) return null;

        // upload file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        if (response) {
            // file uploaded successfully
            console.log("File uploaded on cloudinary ", response.url);
        }
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // delete the local saved file since the file upload operation failed
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadFileOnCloudinary };