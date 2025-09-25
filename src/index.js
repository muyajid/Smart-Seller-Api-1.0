import express from "express";
import dotenv from "dotenv";
import publicRouter from "./router/public-api-router.js";
import erorHandling from "./midleware/eror-midleware.js";
import route from "./router/private-api-router.js";
dotenv.config();

const apps = express();
const PORT = process.env.PORT;

apps.get("/", (req, res) => {
    res.send("Hello World");
});

apps.use(publicRouter);
apps.use(route);
apps.use(erorHandling);

apps.listen(PORT, () => {
    console.info(`[INFO] SEVER RUNNING ON http://localhost:${PORT}`);
})