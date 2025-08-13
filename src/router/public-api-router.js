import { forgotPassword, login, register, resetPassword, verifyToken } from "../controller/account-controller.js";
import express from "express";

const publicRouter = express.Router();

publicRouter.post("/api/v1/auth/register", express.json() ,register);
publicRouter.post("/api/v1/auth/login", express.json(), login);
publicRouter.post("/api/v1/auth/forgot-password", express.json(), forgotPassword);
publicRouter.get("/api/v1/auth/verify-token", verifyToken);
publicRouter.post("/api/v1/auth/reset-password", express.json(), resetPassword);

export default publicRouter