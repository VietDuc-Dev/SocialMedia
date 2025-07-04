import { Router } from "express";
import {
  loginUserController,
  logoutUserController,
  refreshTokenController,
  registerUserController,
  resetPasswordController,
  sendPasswordResetController,
  verifyEmailController,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerUserController);

authRoutes.post("/login", loginUserController);

authRoutes.get("/refresh", refreshTokenController);

authRoutes.get("/logout", logoutUserController);

authRoutes.get("/email/verify/:code", verifyEmailController);

authRoutes.post("/password/forgot", sendPasswordResetController);

authRoutes.post("/password/reset", resetPasswordController);

export default authRoutes;
