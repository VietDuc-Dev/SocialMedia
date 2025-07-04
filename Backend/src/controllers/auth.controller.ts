import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { loginSchema, registerSchema } from "../validation/auth.validation";
import {
  loginUserService,
  registerUserService,
} from "../services/auth.service";
import { HTTPSTATUS } from "../config/http.config";
import { setAuthCookies } from "../utils/cookies";

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User created successfully",
    });
  }
);

export const loginUserController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = loginSchema.parse({
      ...req.body,
      userAgent: req.headers["user-agent"],
    });

    const { user, accessToken, refreshToken } = await loginUserService(body);

    return setAuthCookies({ res, accessToken, refreshToken })
      .status(HTTPSTATUS.OK)
      .json({ message: "Logged in successfully", user });
  }
);
