import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "./constants.js";
import connectDB from "./services/dbService.js";
import { app } from "./app.js";
import { logger } from "./utils/logger.js";

dotenv.config();
connectDB();
const PORT = process.env.PORT || 9120;

app.get("/", (req, res) => {
    res.send("hello world");
});

app.listen(PORT, () =>
    console.log(`listening on port ${PORT}`)
);