import { Router } from "express";
import {
  loginUserController,
  logoutUserController,
  refreshTokenController,
  registerUserController,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerUserController);

authRoutes.post("/login", loginUserController);

authRoutes.get("/refresh", refreshTokenController);

authRoutes.get("/logout", logoutUserController);

export default authRoutes;
