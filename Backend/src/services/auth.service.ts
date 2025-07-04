import { config } from "../config/app.config";
import { VerificationCodeEnum } from "../enums/verification-code.emun";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import { BadRequestException, UnauthorizedException } from "../utils/appError";
import { ONE_DAY_MS, oneYearFromNow, thirtyDaysFromNow } from "../utils/date";
import { getVerifyEmailTemplate } from "../utils/emailTempaletes";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signJwtToken,
  verifyToken,
} from "../utils/jwt";
import { sendMail } from "../utils/sendMail";

export const registerUserService = async (body: {
  username: string;
  email: string;
  password: string;
  userAgent?: string;
}) => {
  const { username, email, password, userAgent } = body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const user = await UserModel.create({
      username,
      email,
      password,
    });

    const userId = user._id;

    const verificationCode = await VerificationCodeModel.create({
      userId,
      type: VerificationCodeEnum.EmailVerification,
      expiresAt: oneYearFromNow(),
    });

    const url = `${config.FRONTEND_ORIGIN}/email/verify/${verificationCode._id}`;

    const { error } = await sendMail({
      to: user.email,
      ...getVerifyEmailTemplate(url),
    });

    if (error) console.error(error);

    await SessionModel.create({
      userId,
      userAgent,
    });

    return { userId };
  } catch (error) {
    throw error;
  }
};

export const loginUserService = async (body: {
  email: string;
  password: string;
  userAgent?: string;
}) => {
  const { email, password, userAgent } = body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new BadRequestException("Email already exists");
    }

    const isMart = await user.comparePassword(password);
    if (!isMart) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const userId = user._id;
    const session = await SessionModel.create({ userId, userAgent });

    const sessionInfo: RefreshTokenPayload = {
      sessionId: session._id,
    };

    const refreshToken = signJwtToken(sessionInfo, refreshTokenSignOptions);
    const accessToken = signJwtToken({ ...sessionInfo, userId });

    return {
      user: user.omitPassword(),
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export const refreshUserAccessTokenService = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  if (!payload) {
    throw new UnauthorizedException("Invalid refresh token");
  }

  const session = await SessionModel.findById(payload.sessionId);
  if (!session) {
    throw new UnauthorizedException("Session not found or revoked");
  }

  const now = Date.now();
  const isExpired = session.expiresAt.getTime() < now;
  if (isExpired) {
    throw new UnauthorizedException("Session expired");
  }

  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionNeedsRefresh) {
    session.expiresAt = thirtyDaysFromNow();
    await session.save();
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signJwtToken({ sessionId: session._id }, refreshTokenSignOptions)
    : undefined;

  const accessToken = signJwtToken({
    userId: session?.userId,
    sessionId: session._id,
  });

  return {
    accessToken,
    newRefreshToken,
  };
};
