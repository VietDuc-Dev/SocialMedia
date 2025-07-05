import express from "express";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import isAuthenticated from "../middlewares/isAuthenticated.middleware";
import sessionRoutes from "./session.route";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/user", isAuthenticated, userRoutes);

router.use("/session", isAuthenticated, sessionRoutes);

export default router;
