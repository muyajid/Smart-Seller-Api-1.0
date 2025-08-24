import express from "express";
import dotenv from "dotenv";
import publicRouter from "./router/public-api-router.js";
import erorHandling from "./midleware/eror-midleware.js";
import privateRouter from "./router/private-api-router.js";
dotenv.config();

const apps = express();
const PORT = process.env.PORT;

apps.use(publicRouter);
apps.use(privateRouter);
apps.use(erorHandling);

apps.listen(PORT, () => {
    console.info(`[INFO] SEVER RUNNING ON http://localhost:${PORT}`);
})