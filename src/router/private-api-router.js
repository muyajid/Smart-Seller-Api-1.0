import express from "express";
import upload from "../midleware/multer-midleware.js";
import jwtAuth from "../midleware/auth-midleware.js";
import {
  addProductController,
  deleteProductController,
  getProductController,
  patchProductController,
} from "../controller/product.controller.js";

const route = express.Router();

route.post(
  "/api/v1/product/",
  jwtAuth,
  upload.array("image", 5),
  addProductController
);

route.use("/images", express.static("images"));

route.get("/api/v1/product", jwtAuth, getProductController);

route.delete("/api/v1/product/", deleteProductController);
// under develop
route.patch("/api/v1/product/", patchProductController);

export default route;
