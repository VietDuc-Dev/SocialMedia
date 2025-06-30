import "dotenv/config";
import express, { urlencoded, NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import mainRouter from "./routes";

import { errorHandler } from "./middlewares/errorHandler.middleware";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";
import { HTTPSTATUS } from "./config/http.config";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(cors({ origin: config.FRONTEND_ORIGIN, credentials: true }));

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException(
      "this is a bad request",
      ErrorCodeEnum.AUTH_INVALID_TOKEN
    );
    return res.status(HTTPSTATUS.OK).json({
      message: "Hello nodejs express",
    });
  })
);

app.use(`${BASE_PATH}`, mainRouter);
app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(
    `Server listen on port ${config.PORT} in ${config.NODE_ENV}: http://localhost:${config.PORT}`
  );
  await connectDatabase();
});
