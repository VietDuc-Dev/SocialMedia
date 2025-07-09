import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
} from "../validation/auth.validation";
import {
  loginUserService,
  refreshUserAccessTokenService,
  registerUserService,
  resetPasswordService,
  sendPasswordResetEmailService,
  verifyEmailService,
} from "../services/auth.service";
import { HTTPSTATUS } from "../config/http.config";
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from "../utils/cookies";
import { verifyToken } from "../utils/jwt";
import SessionModel from "../models/session.model";
import { UnauthorizedException } from "../utils/appError";

// [POST] REGISTER USER
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

// [POST] LOGIN USER
export const loginUserController = asyncHandler(
  async (req: Request, res: Response) => {
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

// [GET] REFRESH TOKEN
export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException("Missing refresh token");
    }

    const { accessToken, newRefreshToken } =
      await refreshUserAccessTokenService(refreshToken);

    if (newRefreshToken) {
      res.cookie(
        "refreshToken",
        newRefreshToken,
        getRefreshTokenCookieOptions()
      );
    }

    return res
      .status(HTTPSTATUS.OK)
      .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
      .json({ message: "Access token refreshed" });
  }
);

// [GET] LOGOUT USER
export const logoutUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const accessToken = req.cookies.accessToken as string | undefined;

    if (!accessToken) {
      return res
        .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to log out" });
    }

    const { payload } = verifyToken(accessToken || "");

    if (payload) {
      await SessionModel.findByIdAndDelete(payload.sessionId);
    }

    return clearAuthCookies(res)
      .status(HTTPSTATUS.OK)
      .json({ message: "Logged out successfully" });
  }
);

// [GET] VERIFY EMAIL
export const verifyEmailController = asyncHandler(
  async (req: Request, res: Response) => {
    const verificationCode = verificationCodeSchema.parse(req.params.code);

    await verifyEmailService(verificationCode);

    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "Email was successfully verified" });
  }
);

// [POST] SEND PASSWORD RESET
export const sendPasswordResetController = asyncHandler(
  async (req: Request, res: Response) => {
    const email = emailSchema.parse(req.body.email);

    await sendPasswordResetEmailService(email);

    return res
      .status(HTTPSTATUS.OK)
      .json({ message: "Password reset email sent" });
  }
);

// [POST] RESET PASSWORD
export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = resetPasswordSchema.parse(req.body);

    await resetPasswordService(body);

    return clearAuthCookies(res)
      .status(HTTPSTATUS.OK)
      .json({ message: "Password was reset successfully" });
  }
);
