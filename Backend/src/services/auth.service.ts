import { config } from "../config/app.config";
import { VerificationCodeEnum } from "../enums/verification-code.emun";
import SessionModel from "../models/session.model";
import UserModel from "../models/user.model";
import VerificationCodeModel from "../models/verificationCode.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";
import { hashValue } from "../utils/bcrypt";
import {
  fiveMinutesAgo,
  ONE_DAY_MS,
  oneHourFromNow,
  oneYearFromNow,
  thirtyDaysFromNow,
} from "../utils/date";
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from "../utils/emailTempaletes";
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signJwtToken,
  verifyToken,
} from "../utils/jwt";
import { sendMail } from "../utils/sendMail";

// REGISTER USER
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

    const url = `${config.BASE_PATH}/api/email/verify/${verificationCode._id}`;

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

// LOGIN USER
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

// REFRESH TOKEN
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

// VERIFY EMAIL
export const verifyEmailService = async (code: string) => {
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeEnum.EmailVerification,
    expiresAt: { $gt: new Date() },
  });
  if (!validCode) {
    throw new NotFoundException("Invalid or expired verification code");
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    { verified: true },
    { new: true }
  );
  if (!updatedUser) {
    throw new BadRequestException("Failed to verify email");
  }

  await validCode.deleteOne();

  return {
    user: updatedUser.omitPassword(),
  };
};

// SEND PASSWORD RESET EMAIL
export const sendPasswordResetEmailService = async (email: string) => {
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const fiveMinAgo = fiveMinutesAgo();
    const count = await VerificationCodeModel.countDocuments({
      userId: user._id,
      type: VerificationCodeEnum.PasswordReset,
      createdAt: { $gt: fiveMinAgo },
    });
    if (count >= 1) {
      throw new BadRequestException("Too many request, please try again later");
    }

    const expiresAt = oneHourFromNow();
    const verificationCode = await VerificationCodeModel.create({
      userId: user._id,
      type: VerificationCodeEnum.PasswordReset,
      expiresAt,
    });

    const url = `${config.BASE_PATH}/password/reset?code=${
      verificationCode._id
    }&exp=${expiresAt.getTime()}`;

    const { data, error } = await sendMail({
      to: email,
      ...getPasswordResetTemplate(url),
    });

    if (!data?.id) {
      throw new BadRequestException(`${error?.name} - ${error?.message}`);
    }

    return { url, emailId: data.id };
  } catch (error) {
    throw error;
  }
};

// RESET PASSWORD
export const resetPasswordService = async (body: {
  verificationCode: string;
  password: string;
}) => {
  const { verificationCode, password } = body;

  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeEnum.PasswordReset,
    expiresAt: { $gt: new Date() },
  });
  if (!validCode) {
    throw new NotFoundException("Invalid or expired verification code");
  }

  const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, {
    password: await hashValue(password),
  });
  if (!updatedUser) {
    throw new BadRequestException("Faided to reset password");
  }

  await validCode.deleteOne();

  await SessionModel.deleteMany({ userid: validCode.userId });

  return { user: updatedUser.omitPassword() };
};
