import express from "express";
import { controlAddProduct } from "../controller/product.controller.js";

const privateRouter = express.Router();

privateRouter.post("/api/v1/product/add", express.json(), controlAddProduct);

export default privateRouter;