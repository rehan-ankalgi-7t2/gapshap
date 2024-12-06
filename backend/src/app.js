import express, { json } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/userRoutes.js";
import { requestLogger } from "./utils/logger.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

/**
 * @description User Routes imports
 */

requestLogger(app);
/**
 * @description User Routes declaration
 */
app.use("/api/v1/users", userRoutes);

export { app };