import { getEnv } from "../utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: getEnv("MONGO_URI", ""),

  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "1d"),

  JWT_REFRESH_SECRET: getEnv("JWT_SECRET"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "30d"),

  EMAIL_SENDER: getEnv("EMAIL_SENDER"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),

  CLOUD_NAME: getEnv("CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),

  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
  FRONTEND_GOOGLE_CALLBACK_URL: getEnv("FRONTEND_GOOGLE_CALLBACK_URL"),
});

export const config = appConfig();
