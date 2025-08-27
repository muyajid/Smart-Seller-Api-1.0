import express from "express";
import { addProductController } from "../controller/product.controller.js";
const privateRouter = express.Router();

privateRouter.post("/api/v1/product/add", express.json(), addProductController);

export default privateRouter;