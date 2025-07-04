import { Router } from "express";
import {
  loginUserController,
  registerUserController,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerUserController);

authRoutes.post("/login", loginUserController);

export default authRoutes;
