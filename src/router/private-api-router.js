import express from "express";
import upload from "../midleware/multer-midleware.js";
import { addProductController, deleteProductController, getProductController } from "../controller/product.controller.js";
import jwtAuth from "../midleware/auth-midleware.js";
const privateRouter = express.Router();

privateRouter.post("/api/v1/product/add", jwtAuth, upload.array("image", 5), addProductController);
privateRouter.use("/images", jwtAuth, express.static("images"));
privateRouter.get("/api/v1/product", jwtAuth ,getProductController);
privateRouter.delete("/api/v1/product/delete", deleteProductController);
export default privateRouter;