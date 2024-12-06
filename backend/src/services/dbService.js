import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    //   console.log("MONGO URI ", `${process.env.MONGO_URI}/${DB_NAME}`);
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URI}/${DB_NAME}`
        );
        console.log(
            `\n MongoDB Connected... DB HOST: ${connectionInstance.connection.host}`
                .inverse.green
        );
    } catch (error) {
        console.log("MONGO_DB CONNECTION ERROR".inverse.red, error);
        process.exit(1);
    }
};

export default connectDB;