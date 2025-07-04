import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { UserDocument } from "../models/user.model";
import { config } from "../config/app.config";
import { SessionDocument } from "../models/session.model";
import { AudienceEnum } from "../enums/user.enum";

export type AccessTokenPayload = {
  userId: UserDocument["_id"];
  sessionId: SessionDocument["_id"];
};

export type RefreshTokenPayload = {
  sessionId: SessionDocument["_id"];
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
};

const defaultAudience: [string] = [AudienceEnum.USER];

const defaultSignOptions: SignOptions = {
  audience: defaultAudience,
};

const defaultVerifyOptions: VerifyOptions = {
  audience: defaultAudience,
};

const JWT_EXPIRES_IN = "1d";
export const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: JWT_EXPIRES_IN || config.JWT_EXPIRES_IN,
  secret: config.JWT_SECRET,
};

const JWT_REFRESH_EXPIRES_IN = "30d";
export const refreshTokenSignOptions: SignOptsAndSecret = {
  expiresIn: JWT_REFRESH_EXPIRES_IN || config.JWT_REFRESH_EXPIRES_IN,
  secret: config.JWT_REFRESH_SECRET,
};

export const signJwtToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptsAndSecret
) => {
  const { secret, ...signOtps } = options || accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    ...defaultSignOptions,
    ...signOtps,
  });
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptions & {
    secret?: string;
  }
) => {
  const { secret = config.JWT_SECRET, ...verifyOpts } = options || {};
  try {
    const decoded = jwt.verify(token, secret, {
      ...defaultVerifyOptions,
      ...verifyOpts,
    });
    return { payload: decoded as unknown as TPayload };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};
