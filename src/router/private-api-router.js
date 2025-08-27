import express from "express";
import { addProductController } from "../controller/product.controller.js";
import jwtAuth from "../midleware/auth-midleware.js";
const privateRouter = express.Router();

privateRouter.post("/api/v1/product/add", express.json(), jwtAuth, addProductController);

export default privateRouter;