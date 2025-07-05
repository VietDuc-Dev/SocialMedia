import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/appError";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { verifyToken } from "../utils/jwt";
import { Types } from "mongoose";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  if (!accessToken) {
    throw new UnauthorizedException(
      "Access token missing",
      ErrorCodeEnum.AUTH_INVALID_TOKEN
    );
  }

  const { error, payload } = verifyToken(accessToken);
  if (!payload) {
    throw new UnauthorizedException(
      error === "jwt expired" ? "Token expired" : "Invalid token",
      ErrorCodeEnum.AUTH_INVALID_TOKEN
    );
  }

  req.userId = payload.userId as string;
  req.sessionId = payload.sessionId as string;

  return next();
};

export default isAuthenticated;
