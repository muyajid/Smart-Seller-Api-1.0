import express from "express";
import upload from "../midleware/multer-midleware.js";
import { addProductController } from "../controller/product.controller.js";
const privateRouter = express.Router();

privateRouter.post("/api/v1/product/add", upload.array("image", 5), addProductController);
export default privateRouter;