import express from "express";
import {
  forgotPasswordController,
  loginController,
  registerController,
  resetPasswordController,
  verifyTokenController,
} from "../controller/user.controller.js";

const publicRouter = express.Router();

publicRouter.post("/api/v1/auth/register", express.json(), registerController);
publicRouter.post("/api/v1/auth/login", express.json(), loginController);
publicRouter.post(
  "/api/v1/auth/forgot-password",
  express.json(),
  forgotPasswordController
);
publicRouter.get("/api/v1/auth/verify-token", verifyTokenController);
publicRouter.put(
  "/api/v1/auth/reset-password",
  express.json(),
  resetPasswordController
);

export default publicRouter;
