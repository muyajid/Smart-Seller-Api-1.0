import express from "express";
import dotenv from "dotenv";
import publicRouter from "./router/public-api.js";
dotenv.config();

const apps = express();
const PORT = process.env.PORT;

apps.use(publicRouter);

apps.listen(PORT, () => {
    console.info(`[INFO] SEVER RUNNING ON http://localhost:${PORT}`);
})